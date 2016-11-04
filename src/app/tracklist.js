import path from 'path';
import globby from 'globby';
import {Promise} from 'bluebird';
import AV from 'av';
import 'flac.js';

export class TrackList {
  constructor(directory) {
    this.tracks = [];
  }

  async addDirectory(directory) {
    const files = await globby(path.join(directory, '**'), {nodir: true});

    await Promise.map(files, file => {
      return new Promise((resolve, reject) => {
        const asset = AV.Asset.fromFile(file);

        asset.get('metadata', metadata => {
          this.tracks.push({
            file: file,
            number: metadata.tracknumber,
            artist: metadata.artist,
            album: metadata.album,
            title: metadata.title,
            date: metadata.date
          });

          console.log('done');
          resolve();
        });

        asset.get('error', err => {
          resolve();
        });
      });
    }, {
      concurrency: 4
    });
  }
}