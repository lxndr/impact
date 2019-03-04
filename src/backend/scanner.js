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

/**
 * @typedef {import('common/types').InspectFile} InspectFile
 * @typedef {import('common/types').FileHandler} FileHandler
 * @typedef {import('./configuration').default} Configuration
 * @typedef {import('./collection').default} Collection
 */

/**
 * @typedef {object} Format
 * @prop {string} ext
 * @prop {FileHandler} handler
 */

const log = debug('impact:scanner');

export default class Scanner {
  /** @type {Format[]} */
  formats = []

  /**
   * @param {Object} options
   * @param {Configuration} options.configuration
   * @param {Collection} options.collection
   */
  constructor({ configuration, collection }) {
    this.configuration = configuration;
    this.collection = collection;

    this.registerFormat('flac', handleFlac);
    this.registerFormat('ape', handleApe);
    this.registerFormat('wv', handleWavPack);
    this.registerFormat('cue', handleCue);
  }

  /**
   * @param {string} ext
   * @param {FileHandler} handler
   */
  registerFormat(ext, handler) {
    this.formats.push({ ext, handler });
  }

  async update() {
    const { changed, removed } = await this.findChangedFiles();

    while (changed.length > 0) {
      const file = changed[0];

      try {
        const files = await this.processChangedFile(file.path);
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

    await this.collection.correct();
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

  /**
   * @param {string} filename
   */
  async processChangedFile(filename) {
    const albums = await this.inspect(filename);
    const files = [];

    for (const { tracks, ...album } of albums) {
      for (const { file, index, ...track } of tracks) {
        await this.collection.upsertTrack({ file, index, album, track });
        files.push(file);

        if (index) {
          files.push(index);
        }
      }
    }

    return files;
  }

  /**
   * @param {string} filename
   */
  async inspect(filename) {
    log(`inspecting ${filename}`);

    const ext = extname(filename);
    const st = await fs.stat(filename);
    const format = this.formats.find(format => format.ext === ext);

    if (!format) {
      throw new Error(`Unknown format '${ext}'`);
    }

    /** @type {InspectFile} */
    const file = {
      type: 'media',
      path: filename,
      size: st.size,
      mtime: st.mtime,
      hash: null,
    };

    const albums = await format.handler({
      file,
      scanner: {
        inspect: this.inspect.bind(this),
      },
    });

    return albums;
  }
}
