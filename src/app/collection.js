import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import debug from 'debug';
import {BehaviorSubject} from 'rxjs';
import * as metadata from './metadata';
import {fs} from './util';
import {stores} from './database';

const log = debug('impact:collection');

const exts = ['flac', 'ogg'].join(',');
const directories = [
  '/home/lxndr/Music'
];

export const update$ = new BehaviorSubject(null).auditTime(1000);
export const error$ = new BehaviorSubject(null);

export function start() {
  update().catch(err => {
    error$.next(err);
  });
}

export async function clear() {
  await stores.tracks.remove({}, {multi: true});
}

export async function update() {
  const tracks = await stores.tracks.find({});

  const patterns = directories.map(directory => path.join(directory, '**', `*.{${exts}}`));
  const files = await globby(patterns, {nodir: true});

  for (const track of tracks) {
    _.pull(files, track.path);

    try {
      const st = await fs.stat(track.path);
      if (st.mtime > track.mtime) {
        const meta = await inspect(track.path);
        await stores.tracks.update(meta, {upsert: true});
        update$.next();
        log(`updating: ${track.path}`);
      }
    } catch (err) {
      /* remove non existing or invalid */
      await stores.tracks.remove({path: track.path});
      update$.next();
      log(`removing: ${track.path}`);
    }
  }

  /* add files */
  for (const file of files) {
    try {
      const meta = await inspect(file);
      await stores.tracks.insert(meta);
      update$.next();
      log(`adding: ${meta.path}`);
    } catch (err) {
      console.error(`Error reading file '${file}': ${err.stack}`);
    }
  }

  log('scanning complete');
}

async function inspect(file) {
  const st = await fs.stat(file);
  const info = await metadata.read(file);

  return {
    ...info,
    path: file,
    mtime: st.mtime,
    size: st.size
  };
}

export function trackById(id) {
  return stores.tracks.findById(id);
}

export async function albumArtists() {
  const tracks = await stores.tracks.find({}, {albumArtist: 1, _id: 0});

  return _(tracks)
    .map('albumArtist')
    .uniq()
    .reject(_.isEmpty)
    .value();
}

export async function allOfArtist(artist) {
  return await stores.tracks.find({
    $or: [
      {albumArtist: artist},
      {artist}
    ]
  });
}
