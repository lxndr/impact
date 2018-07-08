import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import fs from 'fs-extra';
import { extname } from './utils';
import CollectionSnapshot from './collection-snapshot';
import handleCue from './formats/cue';
import handleFlac from './formats/flac';
import handleApe from './formats/ape';

export default class Scanner {
  formats = []

  constructor(application) {
    this.configuration = application.configuration;
    this.collection = application.collection;

    this.registerFormat('flac', handleFlac);
    this.registerFormat('ape', handleApe);
    this.registerFormat('cue', handleCue);
  }

  registerType(name, handler) {
    this.types[name] = handler;
  }

  registerFormat(ext, handler) {
    this.formats.push({ ext, handler });
  }

  async update() {
    const fileDiff = await this.findChangedFiles();

    for (const file of fileDiff.changed) {
      const oldData = await CollectionSnapshot.forFile(this.collection, file);
      const newData = this.inspectFiles(oldData.files);
      this.applyChanges(oldData, newData);
    }

    for (const file of fileDiff.removed) {
      const oldData = await CollectionSnapshot.forFile(this.collection, file);
      this.applyChanges(oldData, []);
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
          changed.push({ dbfile, st });
        }
      } catch (err) {
        removed.push({ dbfile });
      }
    }

    return { added: files, changed, removed };
  }

  async inspect(filename) {
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
      rels: [],
    };

    return format.handler({
      file,
      scanner: {
        inspect: this.inspect.bind(this),
      },
    });
  }

  async inspectFiles(files) {
    const snapshot = new CollectionSnapshot();

    while (files.length) {
      const data = this.inspect(files[0]);
      snapshot.add(data);
      _.pullAllBy(files, data.files, 'path');
    }

    return snapshot;
  }

  async applyChanges(oldSnapshot, newSnapshot) {
  }
}
