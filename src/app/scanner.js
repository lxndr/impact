import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import invariant from 'invariant';
import {fs, extname} from './util';
import * as flac from './metadata/flac';

export class Scanner {
  types = {};

  constructor(collection) {
    this.collection = collection;
  }

  registerType(ext, fn) {
    this.types[ext] = fn;
  }

  async run() {
    const directories = [this.collection.application.libararyPath];
    const exts = Object.keys(this.types).join('|');
    const patterns = directories.map(directory => path.join(directory, '**', `*.(${exts})`));
    const files = await globby(patterns, {onlyFiles: true});
    const dbfiles = await this.collection.files();

    for (const dbfile of dbfiles) {
      _.pull(files, dbfile.path);

      try {
        const st = await fs.stat(dbfile.path);

        /* modified file */
        if (st.mtime > dbfile.mtime) {
          await this.upsertFile({dbfile, st});
        }
      } catch (err) {
        /* remove non existing or invalid */
        await this.collection.removeFile(dbfile);
      }
    }

    /* add files */
    for (const file of files) {
      try {
        await this.upsertFile({file});
      } catch (err) {
        console.error(`Error reading file '${file}': ${err.stack}`);
      }
    }
  }

  async upsertFile({file, dbfile, st}) {
    invariant(file || dbfile, 'file or dbfile must be specified');

    if (!file) {
      file = dbfile.path;
    }

    const ext = extname(file);
    const typeHandler = this.types[ext];

    if (!typeHandler) {
      throw new Error(`No handler registered for type '${ext}'`);
    }

    if (!dbfile) {
      dbfile = await this.collection.fileByPath(file);
    }

    if (!st) {
      st = await fs.stat(file);
    }

    dbfile = {
      path: file,
      size: st.size,
      mtime: st.mtime
    };

    await typeHandler(dbfile, this.collection);
  }
}

export async function flacHandler(file, collection) {
  const fd = await fs.open(file.path, 'r');
  const info = await flac.read(fd);
  await fs.close(fd);

  const album = {
    artist: info.albumArtist || null,
    title: info.album,
    releaseDate: info.releaseDate,
    releaseType: info.releaseType,
    discSubtitle: info.discSubtitle,
    discNumber: info.discNumber
  };

  const track = {
    title: info.title,
    genre: info.genre,
    number: info.number,
    duration: info.duration
  };

  await collection.upsertTrack({file, track, album});
}
