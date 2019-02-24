import _ from 'lodash';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import debug from 'debug';
import { Subject } from 'rxjs';
import promiseAll from 'p-map';

/**
 * @typedef {import('common/types').Image} Image
 * @typedef {import('./configuration').default} Configuration
 * @typedef {import('./database').default} Database
 */

const log = debug('impact:collection');

export default class Collection {
  /** @type Subject<void> */
  update$ = new Subject()

  /**
   * @param {Object} options
   * @param {Configuration} options.configuration
   * @param {Database} options.database
   */
  constructor({ configuration, database }) {
    this.configuration = configuration;
    this.database = database;
  }

  async init() {
    await fs.ensureDir(this.configuration.imageDirectory);
    this.update$.next();
  }

  /**
   * Removes all data from the database.
   */
  async clear() {
    await this.database.tracks.remove({}, { multi: true });
    await this.database.albums.remove({}, { multi: true });
    await this.database.images.remove({}, { multi: true });
    await this.database.files.remove({}, { multi: true });
    this.update$.next();
  }

  /**
   * @returns {Promise<boolean>}
   */
  async isEmpty() {
    const nTracks = await this.database.tracks.count();
    return nTracks === 0;
  }

  /**
   * @param {object} file
   * @returns {Promise<number>}
   */
  async upsertFile(file) {
    const dbfile = await this.database.files.findOne({ path: file.path });

    if (dbfile) {
      const { doc } = await this.database.files.update(
        { _id: dbfile._id },
        file,
        { returnUpdatedDocs: true },
      );

      return doc;
    }

    return this.database.files.insert(file);
  }

  async files() {
    return this.database.files.find({});
  }

  /**
   * @param {string} _id
   * @returns {Promise}
   */
  async fileById(_id) {
    return this.database.files.findOne({ _id });
  }

  /**
   * @param {string} path
   */
  async fileByPath(path) {
    return this.database.files.findOne({ path });
  }

  /**
   * @returns {Promise<string[]>}
   */
  async artists() {
    const list = await this.database.albums.find({});

    return _(list)
      .map('artist')
      .uniq()
      .sort()
      .value();
  }

  /**
   * @param {?string} [artist]
   */
  async albumsByArtist(artist = null) {
    return this.database.albums.find({ artist });
  }

  /**
   * @param {?string} artist
   */
  async allOfArtist(artist) {
    const albums = await this.albumsByArtist(artist);
    const ids = _.map(albums, '_id');
    const tracks = await this.database.tracks.find({ album: { $in: ids } });
    return { albums, tracks };
  }

  /**
   * @param {string} _id
   */
  async albumById(_id) {
    return this.database.albums.findOne({ _id });
  }

  /**
   * @param {string} _id
   */
  async trackById(_id) {
    return this.database.tracks.findOne({ _id });
  }

  async tracks() {
    return this.database.tracks.find({});
  }

  async tracksByAlbum(album) {
    return this.database.tracks.findOne({ album });
  }

  async upsertAlbum(album) {
    album = _.defaults({}, album, {
      artist: null,
      title: null,
      releaseDate: null,
      releaseType: null,
      discTitle: null,
      discNumber: 1,
      images: [],
    });

    if (!album.title) {
      _.assign(album, {
        releaseDate: null,
        releaseType: null,
        discTitle: null,
        discNumber: null,
      });
    }

    const q = _.pick(album, ['artist', 'title', 'releaseDate', 'discNumber', 'discTitle']);
    const dbalbum = await this.database.albums.findOne(q);

    if (dbalbum) {
      const { doc } = await this.database.albums.update(
        { _id: dbalbum._id },
        dbalbum,
        { returnUpdatedDocs: true },
      );

      return doc;
    }

    return this.database.albums.insert(album);
  }

  /**
   * @param {Image[]} images
   */
  async upsertImage(images) {
    return promiseAll(images, async (image) => {
      const hash = crypto.createHash('sha1').update(image.blob).digest('hex');
      const dbimage = await this.database.images.findOne({ hash });

      if (dbimage) {
        return dbimage;
      }

      const { mimeType } = image;
      const file = path.join(this.configuration.imageDirectory, hash);
      await fs.writeFile(file, image.blob);

      return this.database.images.insert({ hash, mimeType });
    });
  }

  /**
   * @param {Object} options
   * @param {Object} options.file
   * @param {Object} options.track
   * @param {Object} options.album
   */
  async upsertTrack({ file, track, album }) {
    log(`upserting file ${file.path}`);

    /* file */
    file = await this.upsertFile(file);

    /* album */
    album = await this.upsertAlbum(album);

    /* images */
    const images = this.upsertImage(track.images);

    /* track */
    track = {
      title: null,
      genre: null,
      number: null,
      offset: 0,
      ...track,
      images: _.map(images, 'hash'),
      file: file._id,
      album: album._id,
    };

    track = await this.database.tracks.insert(track);
    this.update$.next();
    return { file, album, track };
  }

  /**
   * @param {Object} dbfile
   * @param {string} dbfile._id
   */
  async removeFile(dbfile) {
    const tracks = await this.database.tracks.find({
      $or: [
        { media: dbfile._id },
        { mediaIndex: dbfile._id },
      ],
    });

    const ids = _.map(tracks, '_id');
    await this.database.tracks.remove({ _id: { $in: ids } });

    const albums = _(tracks).map('album').uniq().value();

    for (const album of albums) {
      const nAlbumTracks = await this.database.tracks.count({ album: album._id });

      if (nAlbumTracks === 0) {
        await this.database.files.remove({ _id: album._id });
      }
    }

    await this.database.files.remove({ _id: dbfile._id });
  }
}
