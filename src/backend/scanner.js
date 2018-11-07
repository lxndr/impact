import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import fs from 'fs-extra';
import debug from 'debug';
import { extname } from './utils';
import handleCue from './formats/cue';
import handleFlac from './formats/flac';
import handleApe from './formats/ape';
import handleWavPack from './formats/wavpack';

const log = debug('impact:scanner');

export default class Scanner {
  formats = []

  constructor({ configuration, collection }) {
    this.configuration = configuration;
    this.collection = collection;

    this.registerFormat('flac', handleFlac);
    this.registerFormat('ape', handleApe);
    this.registerFormat('wv', handleWavPack);
    this.registerFormat('cue', handleCue);
  }

  registerFormat(ext, handler) {
    this.formats.push({ ext, handler });
  }

  async update() {
    const { changed, removed } = await this.findChangedFiles();

    while (changed.length > 0) {
      const file = changed[0];

      try {
        const { files } = await this.processChangedFile(file.path);
        _.pullAllBy(changed, files, 'path');
      } catch (error) {
        console.error(error.message);
        _.pullAllBy(changed, [file], 'path');
      }
    }

    while (removed.length > 0) {
      const file = removed[0];
      await this.collection.removeFile(file);
      _.pullAllBy(removed, [file], 'path');
    }
  }

  async findChangedFiles() {
    const changed = [];
    const removed = [];

    const directories = this.configuration.libararyPath;
    const exts = _(this.formats).map('ext').join('|');
    const patterns = directories.map(directory => path.join(directory, '**', `*.(${exts})`));
    const files = await globby(patterns, { onlyFiles: true });
    const dbfiles = await this.collection.files();

    for (const dbfile of dbfiles) {
      _.pull(files, dbfile.path);

      try {
        const st = await fs.stat(dbfile.path);

        if (st.mtime > dbfile.mtime) {
          changed.push(dbfile);
        }
      } catch (err) {
        removed.push(dbfile);
      }
    }

    for (const path of files) {
      changed.push({ path });
    }

    return { changed, removed };
  }

  async processChangedFile(filename) {
    const { file, albums } = await this.inspect(filename);

    for (const { tracks, ...album } of albums) {
      for (const track of tracks) {
        await this.collection.upsertTrack({ file, album, track });
      }
    }

    return { files: [file] };
  }

  async inspect(filename) {
    log(`inspecting ${filename}`);

    const ext = extname(filename);
    const st = await fs.stat(filename);
    const format = _.find(this.formats, { ext });

    if (!format) {
      throw new Error(`Unknown format '${ext}'`);
    }

    const file = {
      path: filename,
      size: st.size,
      mtime: st.mtime,
    };

    const info = await format.handler({
      filename,
      scanner: {
        inspect: this.inspect.bind(this),
      },
    });

    return { file, ...info };
  }
}
