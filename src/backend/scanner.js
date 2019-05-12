import R from 'ramda';
import pathUtils from 'path';
import globby from 'globby';
import fs from 'fs-extra';
import Queue from 'p-queue';
import { extname } from './utils';
import handleCue from './formats/cue';
import handleFlac from './formats/flac';
import handleApe from './formats/ape';
import handleWavPack from './formats/wavpack';

/**
 * @typedef {import('common/types').InspectFile} InspectFile
 * @typedef {import('common/types').FileHandler} FileHandler
 * @typedef {import('./configuration').default} Configuration
 * @typedef {import('./library').default} Library
 */

/**
 * @typedef {object} Format
 * @prop {string} ext
 * @prop {FileHandler} handler
 */

export default class Scanner {
  /** @type {Format[]} */
  formats = []

  /**
   * @param {Object} options
   * @param {Configuration} options.configuration
   * @param {Library} options.library
   */
  constructor({ configuration, library }) {
    this.configuration = configuration;
    this.library = library;
    this.queue = new Queue({ concurrency: 1 });
    this.working = false;

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
    if (this.working) {
      return;
    }

    this.working = true;

    const { changed, removed } = await this.findChangedFiles();

    this.queue.addAll(changed.map(file => async () => {
      try {
        await this.processChangedFile(file.path);
      } catch (error) {
        console.error(error.message);
      }
    }));

    this.queue.addAll(removed.map(file => async () => {
      try {
        await this.library.removeFile(file);
      } catch (error) {
        console.error(error.message);
      }
    }));

    await this.queue.onIdle();
    await this.library.correct();
    this.working = false;
  }

  async findChangedFiles() {
    const changed = [];
    const removed = [];

    const directories = this.configuration.libararyPath;
    const exts = this.formats.map(format => format.ext).join('|');
    const patterns = directories.map(directory => pathUtils.join(directory, '**', `*.(${exts})`));
    const files = await globby(patterns, { onlyFiles: true });
    const dbfiles = await this.library.files();

    for (const dbfile of dbfiles) {
      try {
        const st = await fs.stat(dbfile.path);

        if (st.mtime > dbfile.mtime) {
          changed.push(dbfile);
        }
      } catch (err) {
        removed.push(dbfile);
      }
    }

    const added = R.differenceWith((path, file) => path === file.path, files, dbfiles);
    added.forEach(path => changed.push({ path }));

    return { changed, removed };
  }

  /**
   * @param {string} filename
   */
  async processChangedFile(filename) {
    const albums = await this.inspect(filename);
    const files = [];

    for (const album of albums) {
      for (const track of album.tracks) {
        await this.library.upsertTrack(track, album);
        files.push(track.file, track.index);
      }
    }

    return files;
  }

  /**
   * @param {string} filename
   */
  async inspect(filename) {
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
