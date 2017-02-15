import _ from 'lodash';
import path from 'path';
import {inject} from '@lxndr/di';
import {Config} from '@lxndr/config';
import {Database} from '@lxndr/orm';
import {Collection} from './collection';
import {Playback} from './playback';
import * as store from './store';

export class Application {
  @inject(Config) config;
  @inject(Database) db;
  @inject(Collection) collection;
  @inject(Playback) playback;
  closed = false;

  async init() {
    this.setupDatabase();
    this.collection.start();

    store.collection.artists = () => {
      return this.collection.artists();
    };

    store.collection.allOfArtist = artist => {
      return this.collection.allOfArtist(artist);
    };

    ['toggle', 'play', 'stop', 'previous', 'next', 'setupPlaylist', 'track$']
      .forEach(key => {
        if (typeof this.playback[key] === 'function') {
          store.playback[key] = _.bindKey(this.playback, key);
        } else {
          store.playback[key] = this.playback[key];
        }
      });
  }

  setupDatabase() {
    const dbPath = path.join(this.userDirectory, 'databases');

    this.db = new Database({
      driver: 'nedb',
      collections: [{
        name: 'tracks',
        path: path.join(dbPath, 'tracks.db'),
        indexes: [{
          field: 'path',
          unique: true
        }]
      }]
    });
  }

  async deinit() {
    this.closed = true;
    await this.db.close();
  }
}
