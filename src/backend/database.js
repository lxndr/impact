import path from 'path';
import fs from 'fs-extra';
import Nedb from 'nedb';
import promiseAll from 'p-map';
import { promiseFromCallback } from './utils';

/**
 * @typedef {import('nedb')} Nedb
 * @typedef {import('common/types').DbFile} DbFile
 * @typedef {import('common/types').DbImage} DbImage
 * @typedef {import('common/types').DbAlbum} DbAlbum
 * @typedef {import('common/types').DbTrack} DbTrack
 * @typedef {import('common/types').DbCollection} DbCollection
 * @typedef {import('./configuration').default} Configuration
 */

/**
 * @template T
 */
class Datastore {
  nedb = new Nedb()

  /**
   * @param {object} options
   * @param {string} options.filename
   * @param {Array<Nedb.EnsureIndexOptions>} options.indices
   */
  async init({ filename, indices }) {
    this.nedb = new Nedb({ filename, autoload: true });

    await promiseAll(indices, (index) => {
      promiseFromCallback(cb => this.nedb.ensureIndex(index, cb));
    });
  }

  /**
   * @param {object} [query]
   * @param {Nedb.RemoveOptions} [options]
   * @return {Promise<number>}
   */
  remove(query = {}, options = {}) {
    return promiseFromCallback(cb => this.nedb.remove(query, options, cb));
  }

  /**
   * @param {object} [query]
   * @return {Promise<number>}
   */
  count(query = {}) {
    return promiseFromCallback(cb => this.nedb.count(query, cb));
  }

  /**
   * @param {object} [query]
   * @returns {Promise<T[]>}
   */
  find(query = {}) {
    return promiseFromCallback(cb => this.nedb.find(query, cb));
  }

  /**
   * @param {object} query
   * @returns {Promise<?T>}
   */
  findOne(query) {
    return promiseFromCallback(cb => this.nedb.findOne(query, cb));
  }

  /**
   * @param {object} doc
   * @returns {Promise<T>}
   */
  insert(doc) {
    return promiseFromCallback(cb => this.nedb.insert(doc, cb));
  }

  /**
   * @param {object} query
   * @param {object} updateQuery
   * @param {Nedb.UpdateOptions} [options]
   * @returns {Promise<{ count: number, doc?: T, docs?: T[], upsert: boolean }>}
   */
  update(query, updateQuery, options = {}) {
    return new Promise((resolve, reject) => {
      this.nedb.update(query, updateQuery, options, (err, count, docs, upsert) => {
        if (err) {
          reject(err);
          return;
        }

        if (options.returnUpdatedDocs) {
          if (options.multi) {
            resolve({ count, docs, upsert });
          } else {
            resolve({ count, doc: docs, upsert });
          }
        } else {
          resolve({ count, upsert: docs });
        }
      });
    });
  }
}

export default class Database {
  /** @type {Datastore<DbFile>} */
  files = new Datastore()

  /** @type {Datastore<DbAlbum>} */
  albums = new Datastore()

  /** @type {Datastore<DbImage>} */
  images = new Datastore()

  /** @type {Datastore<DbTrack>} */
  tracks = new Datastore()

  /** @type {Datastore<DbCollection>} */
  collections = new Datastore()

  /**
   * @param {object} options
   * @param {Configuration} options.configuration
   */
  constructor({ configuration }) {
    this.configuration = configuration;
  }

  /**
   * Initializes database.
   */
  async init() {
    const { dbDirectory } = this.configuration;
    await fs.ensureDir(dbDirectory);

    await this.files.init({
      filename: path.join(dbDirectory, 'files.db'),
      indices: [
        { fieldName: 'path', unique: true },
      ],
    });

    await this.albums.init({
      filename: path.join(dbDirectory, 'albums.db'),
      indices: [
        { fieldName: 'artist' },
      ],
    });

    await this.images.init({
      filename: path.join(dbDirectory, 'images.db'),
      indices: [
        { fieldName: 'hash' },
      ],
    });

    await this.tracks.init({
      filename: path.join(dbDirectory, 'tracks.db'),
      indices: [
        { fieldName: 'file' },
        { fieldName: 'album' },
      ],
    });

    await this.collections.init({
      filename: path.join(dbDirectory, 'collections.db'),
      indices: [],
    });
  }
}
