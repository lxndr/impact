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

  registerFormat(ext, handler) {
    this.formats.push({ ext, handler });
  }

  async update() {
    const { changed, removed } = await this.findChangedFiles();

    while (changed.length) {
      const file = changed[0];
      const oldData = await CollectionSnapshot.forFile(this.collection, file);
      const newData = await this.inspectFiles(/* oldData.files */ [file]);

      this.applyChanges(oldData, newData);

      _.pullAllBy(changed, oldData.files, 'path');
      _.pullAllBy(changed, newData.files, 'path');
    }

    while (removed.length) {
      const file = removed[0];
      const oldData = await CollectionSnapshot.forFile(this.collection, file);
      const newData = new CollectionSnapshot();
      this.applyChanges(oldData, newData);
      _.pullAllBy(changed, oldData.files, 'path');
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

    const added = files.map(file => ({ path: file }));

    return {
      changed: [...changed, ...added],
      removed,
    };
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

    const info = await format.handler({
      filename,
      scanner: {
        inspect: this.inspect.bind(this),
      },
    });

    return { file, ...info };
  }

  async inspectFiles(files) {
    const snapshot = new CollectionSnapshot();

    while (files.length) {
      const data = await this.inspect(files[0].path);
      snapshot.add(data);
      _.pullAllBy(files, snapshot.files, 'path');
    }

    return snapshot;
  }

  async applyChanges(oldSnapshot, newSnapshot) {
    for (const file of newSnapshot.files) {
      await this.collection.upsertFile(file);
    }

    for (const { tracks, ...album } of newSnapshot.albums) {
      for (const { file, ...track } of tracks) {
        await this.collection.upsertTrack({ file, album, track });
      }
    }
  }
}
