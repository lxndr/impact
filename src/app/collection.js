import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import {Promise} from 'bluebird';
import {inject} from '@lxndr/di';
import {Database} from '@lxndr/orm';
import {fs, gst} from './util';

export class Collection {
  @inject(Database) db;
  queue = [];

  directories = [
    '/home/lxndr/Music'
  ];

  start() {
    this.update().catch(err => {
      console.error(err.stack);
    });
  }

  async clear() {
    const col = this.db.collection('tracks');
    await col.remove();
  }

  async update() {
    const col = this.db.collection('tracks');

    const tracks = await col.find();
    const files = [].concat(...await Promise.all(
      this.directories.map(
        directory => globby(path.join(directory, '**', '*.flac'), {nodir: true})
      )
    ));

    /* remove non existing */
    for (const track of tracks) {
      _.pull(files, track.path);

      try {
        const st = await fs.stat(track.path);
        if (st.mtime > track.mtime) {
          const meta = await this.inspect(track.path);
          await col.upsert(meta);
        }
      } catch (err) {
        await col.remove({path: track.path});
      }
    }

    /* add files */
    for (const file of files) {
      try {
        const meta = await this.inspect(file);
        await col.insert(meta);
        console.log(`Adding: ${meta.path}`);
      } catch (err) {
        console.error(`Error reading file '${file}': ${err.stack}`);
      }
    }
  }

  async inspect(file) {
    const st = await fs.stat(file);
    const meta = await gst.metadata(file);

    const map = {
      trackNumber: 'number',
      artist: 'artists',
      albumArtist: 'albumArtists'
    };

    const keys = [
      'number',
      'title',
      'artists',
      'album',
      'albumArtists'
    ];

    const info = _(meta)
      .mapKeys((val, key) => _.camelCase(key))
      .mapKeys((val, key) => map[key] || key)
      .pick(keys)
      .value();

    _.assign(info, {
      path: file,
      mtime: st.mtime,
      size: st.size
    });

    return info;
  }

  async artists() {
    const tracks = await this.db.collection('tracks').find();
    const artists = new Set();

    _.forEach(tracks, track => {
      _.forEach(track.artists, artist => {
        artists.add(artist);
      });
    });

    return Array.from(artists).sort();
  }

  async albums() {
    const col = this.db.collection('tracks');
    return await col.find({
      groupBy: 'album'
    });
  }

  album(title) {
    return this.db.tracks.where('album').equals(title).toArray();
  }

  async allOfArtist(artist) {
    const tracks = await this.db.collection('tracks').find();

    return _.filter(tracks, track => {
      return _.includes(track.artists, artist);
    });
  }
}
