import _ from 'lodash';
import path from 'path';
import iconv from 'iconv-lite';
import globby from 'globby';
import debug from 'debug';
import {BehaviorSubject} from 'rxjs';
import * as metadata from './metadata';
import {fs} from './util';
import {stores} from './database';

/*

Schemas:

  files:
    _id
    path
    mtime
    index
      path
      mtime

  tracks
    _id
    title
    number
    album
    duration
    source
      file
      offset

  albums
    _id
    title
    artist
    artwork
      name
      path

  playlists
    _id
    name
    tracks

*/

const log = debug('impact:collection');

const directories = [
  '/home/lxndr/_Music'
];

export const update$ = new BehaviorSubject(null).auditTime(1000);
export const error$ = new BehaviorSubject(null);

export function start() {
  update().catch(err => {
    console.error(err);
    error$.next(err);
  });
}

export async function clear() {
  await stores.tracks.remove({}, {multi: true});
}

export async function update() {
  const patterns = directories.map(directory => path.join(directory, '**'));
  const files = await globby(patterns, {nodir: true, nosort: true});

  const dbfiles = await stores.files.find({});

  for (const dbfile of dbfiles) {
    _.pull(files, dbfile.path);

    try {
      const st = await fs.stat(dbfile.path);

      /* modified file */
      if (st.mtime > dbfile.mtime) {
        await updateFile(dbfile, st);
      }
    } catch (err) {
      /* remove non existing or invalid */
      await removeFile(dbfile);
    }
  }

  /* add files */
  for (const file of files) {
    try {
      await addFile(file);
    } catch (err) {
      console.error(`Error reading file '${file}': ${err.stack}`);
    }
  }

  log('scanning complete');
}

async function inspectFile(file, getstat) {
  const ext = path.extname(file).toLowerCase();
  let type = null;
  let info = null;
  let stat = null;

  if (ext === '.cue') {
    type = 'index';
    const buf = await fs.readFile(file);
    const str = iconv.decode(buf, 'windows-1251');
    info = metadata.cue.parse(str);
  } else if (ext === '.flac') {
    type = 'media';
    info = await metadata.read(file);
  }

  if (getstat) {
    stat = await fs.stat(file);
  }

  return {type, info, stat};
}

async function addFile(file) {
  let dbfile = await stores.files.findOne({
    path: file
  });

  if (dbfile && dbfile.index) {
    return;
  }

  const {type, info, stat} = await inspectFile(file, true);

  if (!type) {
    return;
  }

  log(`adding file ${file}`);

  dbfile = await stores.files.insert({
    path: file,
    size: stat.size,
    mtime: stat.mtime
  });

  switch (type) {
    case 'index':
      await addCue(dbfile, info);
      break;
    case 'media':
      await addSingleTrack(dbfile, info);
      break;
    default:
      break;
  }
}

async function updateFile(dbfile, st) {
  log(`updating file ${dbfile.path}`);

  await stores.files.update({
    _id: dbfile._id
  }, {
    ...dbfile,
    size: st.size,
    mtime: st.mtime
  });
}

async function removeFile(file) {
  log(`removing file ${file.path}`);

  if (file.media || file.index) {
    await stores.files.remove({_id: file.media || file.index});
  }

  await stores.files.remove({_id: file._id});
}

async function removeFileByPath(path) {
  const file = await stores.files.findOne({path});

  if (file) {
    await removeFile(file);
  }
}

async function addTrack(dbfile, info) {
  const album = {
    artist: info.albumArtist,
    title: info.album,
    releaseDate: info.releaseDate,
    releaseType: info.releaseType,
    discSubtitle: info.discSubtitle,
    discNumber: info.discNumber
  };

  if (typeof album.discSubtitle === 'undefined') {
    delete album.discSubtitle;
  }

  let dbalbum = await stores.albums.findOne(album);

  if (!dbalbum) {
    dbalbum = await stores.albums.insert({...album, items: []});
  }

  const dbtrack = await stores.tracks.insert({
    title: info.title,
    album: dbalbum._id,
    genre: info.genre,
    number: info.number
  });

  await stores.albums.update(
    {_id: dbalbum._id},
    {$push: {items: dbtrack._id}}
  );
}

async function addSingleTrack(dbfile, info) {
  await addTrack(dbfile, info);
}

async function addCue(dbfile, cue) {
  if (!cue.files) {
    return;
  }

  const dirname = path.dirname(dbfile.path);

  for (const file of cue.files) {
    const mediaPath = path.resolve(dirname, file.name);
    const {type: mediaType, info: mediaInfo, stat: mediaStat} = await inspectFile(mediaPath, true);

    if (mediaType !== 'media') {
      // error
      continue;
    }

    await removeFileByPath(mediaPath);

    const mediaFile = await stores.files.insert({
      path: mediaPath,
      index: dbfile._id,
      size: mediaStat.size,
      mtime: mediaStat.mtime
    });

    await stores.files.update(
      {_id: dbfile._id},
      {$set: {media: mediaFile._id}}
    );

    const dbalbum = await stores.albums.insert({
      artist: cue.performer,
      items: []
    });

    for (const [index, track] of file.tracks.entries()) {
      const offset = (track.indexes && track.indexes.length && track.indexes[0].time) || 0;
      const nextTrack = file.tracks[index + 1];
      const nextOffset = (nextTrack && nextTrack.indexes && nextTrack.indexes.length && nextTrack.indexes[0].time) || mediaInfo.duration;
      const duration = nextOffset - offset;

      const dbtrack = await stores.tracks.insert({
        file: dbfile._id,
        offset, duration,
        number: track.number,
        title: track.title,
        artists: [track.performer],
        album: dbalbum._id
      });

      await stores.albums.update(
        {_id: dbalbum._id},
        {$push: {items: dbtrack._id}}
      );
    }
  }
}

export function trackById(id) {
  return stores.tracks.findOne({_id: id});
}

export async function albumArtists() {
  const tracks = await stores.tracks.find({}, {albumArtist: 1, _id: 0});

  return _(tracks)
    .map('albumArtist')
    .uniq()
    .sort()
    .value();
}

export function allOfArtist(artist) {
  return stores.tracks.find({
    $or: [
      {albumArtist: artist},
      {artist}
    ]
  });
}
