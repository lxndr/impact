import _ from 'lodash';
import path from 'path';
import debug from 'debug';
import iconv from 'iconv-lite';
import invariant from 'invariant';
import {fs} from './util';

/*

Schemas:

  files:
    _id
    path
    mtime

  tracks
    _id
    title
    number
    album
    duration
    file
    ?offset

  albums
    _id
    title
    artist
    artwork
      name
      path

*/

const log = debug('impact:collection');

export class Collection {
  constructor(database) {
    this.database = database;
  }

  async clear() {
    await this.database.tracks.remove({}, {multi: true});
    await this.database.albums.remove({}, {multi: true});
    await this.database.files.remove({}, {multi: true});
  }

  async files() {
    return this.database.files.find({});
  }

  async fileById(_id) {
    return this.database.files.findOne({_id});
  }

  async fileByPath(path) {
    return this.database.files.findOne({path});
  }

  async artists() {
    const list = await this.database.albums.find({}, {artist: 1});
    return _(list).map('artist').uniq().sort().value();
  }

  async allOfArtist(artist) {
    const albums = await this.database.albums.find({artist});
    const ids = _.map(albums, '_id');
    const tracks = await this.database.tracks.find({album: {$in: ids}});
    return {albums, tracks};
  }

  async albumById(_id) {
    return this.database.albums.findOne({_id});
  }

  async trackById(_id) {
    return this.database.tracks.findOne({_id});
  }

  async tracks() {
    return this.database.tracks.find({});
  }

  async upsertTrack({file, track, album}) {
    log(`upserting file ${file.path}`);

    /* file */
    let dbfile = await this.database.files.findOne({path: file.path});

    if (!dbfile) {
      dbfile = await this.database.files.insert(file);
    }

    /* album */
    _.defaults(album, {
      artist: null,
      title: null,
      releaseDate: null,
      releaseType: null,
      discSubtitle: null,
      discNumber: null
    });

    if (!album.title) {
      _.assign(album, {
        releaseDate: null,
        releaseType: null,
        discSubtitle: null,
        discNumber: null
      });
    }

    let dbalbum = await this.database.albums.findOne(album);

    if (!dbalbum) {
      dbalbum = await this.database.albums.insert(album);
    }

    /* track */
    _.defaults(track, {
      title: null,
      genre: null,
      number: null
    });

    _.assign(track, {
      file: dbfile._id,
      album: dbalbum._id
    });

    const dbtrack = await this.database.tracks.insert(track);
  }

  async removeFile({file, dbfile}) {
    invariant(file || dbfile, 'file or dbfile must be specified');

    if (!dbfile) {
      dbfile = await this.fileByPath(file);
    }

    await this.database.files.remove({_id: dbfile._id});
  }
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
