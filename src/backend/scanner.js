import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import fs from 'fs-extra';
import debug from 'debug';
import { extname } from './utils';
import handleCue from './formats/cue';
import handleFlac from './formats/flac';
import handleApe from './formats/ape';

const log = debug('impact:scanner');

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
    await this.collection.clear();

    const directories = this.configuration.libararyPath;
    const exts = _(this.formats).map('ext').join('|');
    const patterns = directories.map(directory => path.join(directory, '**', `*.(${exts})`));
    const files = await globby(patterns, { onlyFiles: true });

    let list = [];

    for (const filename of files) {
      try {
        const file = await this.inspect(filename);
        list.push(file);
      } catch (err) {
        console.error(err);
      }
    }

    const filesToRemove = _(list)
      .filter({ type: 'index' })
      .flatMap(info => (
        _.flatMap(info.albums, album => (
          _.map(album.tracks, 'file.path')
        ))
      ))
      .uniq()
      .value();

    list = _.pullAllWith(list, filesToRemove, (arrVal, othVal) => arrVal.file.path === othVal);

    for (const { type, file, ...info } of list) {
      switch (type) {
        case 'media': {
          const { album, track } = info;
          await this.collection.upsertTrack({ file, album, track });
          break;
        }
        case 'index': {
          const { albums } = info;
          for (const { tracks, ...album } of albums) {
            for (const { file, ...track } of tracks) {
              await this.collection.upsertTrack({ file, album, track });
            }
          }
          break;
        }
        default:
          break;
      }
    }
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
