import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import fs from 'fs-extra';
import { extname } from './utils';
import handleCue from './formats/cue';
import handleFlac from './formats/flac';
import handleApe from './formats/ape';

export default class Scanner {
  types = {}

  formats = []

  constructor(application) {
    this.configuration = application.configuration;
    this.collection = application.collection;

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
    this.formats.push({ ext, handler });
  }

  async update() {
    const fileDiff = await this.findChangedFiles();

    for (const file of fileDiff.changed) {
      const oldData = await this.getOldData(file);
      const newData = await this.getNewData(oldData.files);
      this.applyChanges(oldData, newData);
    }

    for (const file of fileDiff.removed) {
      const oldData = await this.getOldData(file);
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

  async getOldData(dbfile) {
    const files = [dbfile];

    /* get all related files */
    for (const file of files) {
      if (file.rels) {
        for (const id of file.rels) {
          if (!_.find(files, { id })) {
            const nfile = await this.collection.fileById(id);
            files.push(nfile);
          }
        }
      }
    }

    const tracks = _.flatten(
      await Promise.all(
        files.map(file => this.collection.tracksByFile(file.id)),
      ),
    );

    const albums = await Promise.all(
      _.uniqBy(tracks, 'id').map(track => this.collection.albumById(track.id)),
    );

    return { files, albums, tracks };
  }

  async getNewData(file) {
    const { type, data } = await this.inspect(file);
    const st = await fs.stat(file);

    const dbfile = {
      path: file.path,
      size: st.size,
      mtime: st.mtime,
      rels: [],
    };

    // const data = await this.types[type](dbfile, data);
    return data;
  }

  async inspect(file) {
    const ext = extname(file);
    const format = _.find(this.formats, { ext });

    if (!format) {
      throw new Error(`Unknown format '${ext}'`);
    }

    return format.handler({ file, scanner: this });
  }

  async applyChanges(oldData, newData) {
  }

  async addMediaFile(file, { album, track }) {
    await this.collection.upsertTrack({ file, album, track });
  }

  async addIndexFile(indexFile, { album, files }) {
    const indexFileId = await this.collection.upsertFile(indexFile);
    const rels = [];

    for (const file of files) {
      const st = await fs.stat(file.path);

      const dbfile = {
        path: file.path,
        size: st.size,
        mtime: st.mtime,
        rels: [indexFileId],
      };

      for (const track of file.tracks) {
        const { fileId } = await this.collection.upsertTrack({ file: dbfile, album, track });
        rels.push(fileId);
      }
    }

    await this.collection.upsertFile({ ...indexFile, rels: _.uniq(rels) });
  }
}
