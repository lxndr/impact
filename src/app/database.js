import _ from 'lodash';
import path from 'path';
import {app} from 'electron';
import Datastore from 'nedb-promise';

export const stores = {
  files: {
    indexes: [{
      fieldName: 'path',
      unique: true
    }]
  },
  tracks: {
    indexes: [{
      fieldName: 'file'
    }, {
      fieldName: 'album'
    }]
  },
  albums: {
    indexes: [{
      fieldName: 'artist'
    }]
  }
};

export class Database {
  async init() {
    const userDirectory = app.getPath('userData');
    const dbPath = path.join(userDirectory, 'databases');

    return Promise.all(
      _.map(stores, async (desc, name) => {
        const store = new Datastore({
          filename: path.join(dbPath, `${name}.db`)
        });

        await store.loadDatabase();

        if (desc.indexes) {
          for (const index of desc.indexes) {
            await store.ensureIndex(index);
          }
        }

        this[name] = store;
      })
    );
  }
}
