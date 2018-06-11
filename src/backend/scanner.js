import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import invariant from 'invariant';
import fs from 'fs-extra';
import {inject} from '@lxndr/di';
import {Configuration} from './configuration';
import {Collection} from './collection';
import {extname} from './util';
import handleCue from './formats/cue';
import handleFlac from './formats/flac';
import handleApe from './formats/ape';

export class Scanner {
  @inject(Configuration) configuration

  @inject(Collection) collection

  types = {}

  formats = []

  working = false

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

  async update() {
    const fileDiff = await this.findChangedFiles();

    for (const file of fileDiff.changed) {
      const oldData = await this.getExistingData(file);
      // const newData = await this.;
    }
  }

  async findChangedFiles() {
    const changed = [];
    const removed = [];

    const directories = this.configuration.libararyPath;
    const exts = _(this.formats).map('ext').join('|');
    const patterns = directories.map(directory => path.join(directory, '**', `*.(${exts})`));
    const files = await globby(patterns, {onlyFiles: true});
    const dbfiles = await this.collection.files();

    for (const dbfile of dbfiles) {
      _.pull(files, dbfile.path);

      try {
        const st = await fs.stat(dbfile.path);

        if (st.mtime > dbfile.mtime) {
          changed.push({dbfile, st});
        }
      } catch (err) {
        removed.push({dbfile});
      }
    }

    return {added: files, changed, removed};
  }

  async getExistingData(dbfile) {
    const files = [dbfile];

    for (const file of files) {
      if (file.rels) {
        for (const id of file.rels) {
          if (!_.find(files, {id})) {
            const rel = await this.collection.fileById(id);
            files.push(rel);
          }
        }
      }
    }

    const tracks = _.flatten(
      await Promise.all(
        files.map(
          await this.collection.tracksByFile(file.id)
        )
      )
    );

    const albums = await Promise.all(
      _.uniqBy(tracks, 'id').map(id => this.collection.albumById(id))
    );

    return {files, albums, tracks};
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
