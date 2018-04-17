import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import invariant from 'invariant';
import fs from 'fs-extra';
import {inject} from '@lxndr/di';
import {Configuration} from './configuration';
import {Collection} from './collection';
import {extname} from './util';
import * as flac from './metadata/flac';
import * as cue from './metadata/cue';
import handleApe from './formats/ape';

export class Scanner {
  @inject(Configuration) configuration

  @inject(Collection) collection

  types = {}

  formats = []

  queue = []

  constructor() {
    this.registerType('index', this.addIndexFile);
    this.registerType('media', this.addMediaFile);

    this.registerFormat('flac', handleFlac);
    this.registerFormat('ape', handleApe);
    this.registerFormat('cue', handleCue);
  }

  registerType(name, handler) {
    this.types[name] = handler;
  }

  registerFormat(ext, handler) {
    this.formats.push({ext, handler});
  }

  start() {
    this.run();
  }

  stop() {
    this.queue = [];
  }

  async run() {
    const directories = this.configuration.libararyPath;
    const exts = _(this.formats).map('ext').join('|');
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

  async inspect(file) {
    const ext = extname(file);
    const format = _.find(this.formats, {ext});

    if (!format) {
      throw new Error(`Unknown format '${ext}'`);
    }

    return format.handler({file, scanner: this});
  }

  async upsertFile({file, dbfile, st}) {
    invariant(file || dbfile, 'file or dbfile must be specified');

    if (!file) {
      file = dbfile.path;
    }

    const {type, data} = await this.inspect(file);

    if (!st) {
      st = await fs.stat(file);
    }

    dbfile = {
      path: file,
      size: st.size,
      mtime: st.mtime
    };

    await Reflect.apply(this.types[type], this, [dbfile, data]);
  }

  async addMediaFile(file, {album, track}) {
    await this.collection.upsertTrack({file, album, track});
  }

  async addIndexFile(indexFile, {album, files}) {
    const indexFileId = await this.collection.upsertFile(indexFile);
    const rels = [];

    for (const file of files) {
      const st = await fs.stat(file.path);

      const dbfile = {
        path: file.path,
        size: st.size,
        mtime: st.mtime,
        rels: [indexFileId]
      };

      for (const track of file.tracks) {
        const {fileId} = await this.collection.upsertTrack({file: dbfile, album, track});
        rels.push(fileId);
      }
    }

    await this.collection.upsertFile({...indexFile, rels: _.uniq(rels)});
  }
}

export async function handleFlac({file}) {
  const fd = await fs.open(file, 'r');
  const info = await flac.read(fd);
  await fs.close(fd);

  const album = {
    artist: info.albumArtist || null,
    title: info.album,
    releaseDate: info.releaseDate,
    releaseType: info.releaseType,
    discTitle: info.discTitle,
    discNumber: info.discNumber
  };

  const track = {
    title: info.title,
    genre: info.genre,
    number: info.number,
    duration: info.duration
  };

  return {type: 'media', data: {album, track}};
}

export async function handleCue({file, scanner}) {
  const str = await fs.readFile(file, 'utf8');
  const info = cue.parse(str);

  const date = _.chain(info.remarks).find({key: 'DATE'}).get('value').value();
  const genre = _.chain(info.remarks).find({key: 'GENRE'}).get('value').value();

  const album = {
    artist: info.performer || null,
    title: info.title,
    date
  };

  const files = await Promise.all(
    info.files.map(async f => {
      const mediaPath = path.resolve(path.dirname(file), f.name);
      const mediaInfo = await scanner.inspect(mediaPath);
      let {duration: totalDuration} = mediaInfo.data.track;

      return {
        path: mediaPath,
        tracks: f.tracks.slice().reverse().map(track => {
          const offset = _(track.indexes).sortBy('index').last().time;
          const duration = totalDuration - offset;
          totalDuration = offset;

          return {
            number: track.number,
            title: track.title,
            artists: [track.performer],
            genre,
            offset,
            duration
          };
        }).reverse()
      };
    })
  );

  return {type: 'index', data: {album, files}};
}
