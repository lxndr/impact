import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import Dexie from 'dexie';
import path from 'path';
import globby from 'globby';
import {Promise} from 'bluebird';
import {fs, gst} from './util';
/*
gst.metadata('/home/lxndr/Music/AFI/1995 - Answer That and Stay Fashionable/01 - Two of a Kind.flac', (err, md) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('v', md);
});
*/
@Injectable()
export class CollectionService {
  artists$ = new BehaviorSubject([]);

  constructor() {
    this.db = new Dexie('MyDatabase');
    this.directories = [
      '/home/lxndr/Music'
    ];

    this.db.version(1)
      .stores({
        artists: '++id',
        albums: '++id',
        discs: '++id',
        tracks: '++id, &file, album'
      });

    this.db.tracks.orderBy('artist').uniqueKeys().then(artists => {
      this.artists$.next(artists);
    });
  }

  /**
   * @async
   */
  update() {
    return Promise.each(this.directories, async directory => {
      const pattern = path.join(directory, '**', '*.flac');
      const files = await globby(pattern, {nodir: true});

      await Promise.each(files, async file => {
        console.log(file);
        const meta = await this.inspect(file);
        await this.db.tracks.add(meta);
      });
    });
  }

  async inspect(file) {
    const st = await fs.stat(file);
    const meta = await gst.metadata(file);
    return {
      file,
      size: st.size,
      duration: meta.duration,
      number: meta.number,
      album: meta.album,
      title: meta.title
    };
  }

  albums() {
    return this.db.tracks.orderBy('album').uniqueKeys();
  }

  album(title) {
    return this.db.tracks.where('album').equals(title).toArray();
  }
}
