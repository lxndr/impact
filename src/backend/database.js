import _ from 'lodash';
import path from 'path';
import { ensureDir } from 'fs-extra';
import { remote } from 'electron';
import Datastore from 'nedb';

const collections = {
  files: {
    indices: [{
      fieldName: 'path',
      unique: true,
    }],
  },
  tracks: {
    indices: [{
      fieldName: 'file',
    }, {
      fieldName: 'album',
    }],
  },
  albums: {
    indices: [{
      fieldName: 'artist',
    }],
  },
};

export class Database {
  async init() {
    const configDirectory = remote.app.getPath('userData');
    const dbDirectory = path.join(configDirectory, 'databases');
    await ensureDir(dbDirectory);

    return Promise.all(
      _.map(collections, async ({ indices }, name) => {
        const filename = path.join(dbDirectory, `${name}.db`);
        const store = new Datastore({ filename });

        await Promise.all(
          _.map(indices, index => store.ensureIndex(index)),
        );

        await store.loadDatabase();
        this[name] = store;
      }),
    );
  }
}
