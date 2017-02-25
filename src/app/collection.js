import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import {BehaviorSubject} from 'rxjs';
import * as metadata from './metadata';
import {fs} from './util';
import {db} from './application';

const exts = ['flac', 'ogg'].join(',');
const directories = [
  '/home/lxndr/Music'
];

export const update$ = new BehaviorSubject(null).auditTime(1000);

export function start() {
  update().catch(err => {
    console.error(err.stack);
  });
}

export async function clear() {
  const col = db.collection('tracks');
  await col.remove();
}

export async function update() {
  const col = db.collection('tracks');
  const tracks = await col.find();

  const patterns = directories.map(directory => path.join(directory, '**', `*.{${exts}}`));
  const files = await globby(patterns, {nodir: true});

  for (const track of tracks) {
    _.pull(files, track.path);

    try {
      const st = await fs.stat(track.path);
      if (st.mtime > track.mtime) {
        const meta = await inspect(track.path);
        await col.upsert(meta);
        update$.next();
      }
    } catch (err) {
      /* remove non existing or invalid */
      await col.remove({path: track.path});
      update$.next();
    }
  }

  /* add files */
  for (const file of files) {
    try {
      const meta = await inspect(file);
      await col.insert(meta);
      update$.next();
      console.log(`Adding: ${meta.path}`);
    } catch (err) {
      console.error(`Error reading file '${file}': ${err.stack}`);
    }
  }
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
  const col = db.collection('tracks');
  return col.findById(id);
}

export async function artists() {
  const col = db.collection('tracks');
  const tracks = await col.find();

  return _(tracks)
    .map(track => {
      if (track.albumArtist) {
        return track.albumArtist;
      } else if (track.artist) {
        return track.artist;
      } else if (track.artists && track.artists.length > 0) {
        return track.artists[0];
      }

      return null;
    })
    .uniq()
    .reject(_.isEmpty)
    .value();
}

export async function albums() {
  const col = db.collection('tracks');
  return await col.distinct('album');
}

export async function allOfArtist(artist) {
  const col = db.collection('tracks');

  return await col.find({
    $or: [
      {albumArtist: artist},
      {artist}
    ]
  });
}
