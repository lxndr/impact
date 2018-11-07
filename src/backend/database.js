import _ from 'lodash';
import path from 'path';
import { ensureDir } from 'fs-extra';
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

export default class Database {
  constructor({ dbDirectory }) {
    this.dbDirectory = dbDirectory;
  }

  async init() {
    await ensureDir(this.dbDirectory);

    await Promise.all(
      _.map(collections, async ({ indices }, name) => {
        const filename = path.join(this.dbDirectory, `${name}.db`);
        const store = new Datastore({ filename });

        for (const index of indices) {
          await store.ensureIndex(index);
        }

        await store.loadDatabase();
        this[name] = store;
      }),
    );
  }
}
