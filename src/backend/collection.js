import _ from 'lodash';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import debug from 'debug';
import { Subject } from 'rxjs';
import promiseAll from 'p-map';

/**
 * @typedef {import('common/types').InspectFile} InspectFile
 * @typedef {import('common/types').InspectImage} InspectImage
 * @typedef {import('common/types').InspectAlbum} InspectAlbum
 * @typedef {import('common/types').InspectTrack} InspectTrack
 * @typedef {import('common/types').DbFile} DbFile
 * @typedef {import('common/types').DbTrack} DbTrack
 * @typedef {import('common/types').DbAlbum} DbAlbum
 * @typedef {import('common/types').Track} Track
 * @typedef {import('./configuration').default} Configuration
 * @typedef {import('./database').default} Database
 */

const log = debug('impact:collection');

export default class Collection {
  /** @type Subject<void> */
  update$ = new Subject()

  /**
   * @param {object} options
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
   * @param {InspectFile} file
   * @returns {Promise<DbFile>}
   */
  async upsertFile(file) {
    const dbfile = await this.database.files.findOne({ path: file.path });

    if (dbfile) {
      const { doc } = await this.database.files.update(
        { _id: dbfile._id },
        file,
        { returnUpdatedDocs: true },
      );

      if (!doc) {
        throw new Error();
      }

      return doc;
    }

    return this.database.files.insert(file);
  }

  /**
   * @returns {Promise<DbFile[]>}
   */
  async files() {
    return this.database.files.find({});
  }

  /**
   * @param {string} _id
   * @returns {Promise<?DbFile>}
   */
  async fileById(_id) {
    return this.database.files.findOne({ _id });
  }

  /**
   * @param {string} path
   * @returns {Promise<?DbFile>}
   */
  async fileByPath(path) {
    return this.database.files.findOne({ path });
  }

  /**
   * @returns {Promise<(string | null)[]>}
   */
  async artists() {
    const albums = await this.database.albums.find({});

    return _(albums)
      .map('artist')
      .uniq()
      .sort()
      .value();
  }

  /**
   * @param {?string} artist
   * @returns {Promise<DbAlbum[]>}
   */
  async albumsByArtist(artist = null) {
    return this.database.albums.find({ artist });
  }

  /**
   * @param {?string} artist
   */
  async allOfArtist(artist) {
    const albums = await this.albumsByArtist(artist);

    const albumIds = _.map(albums, '_id');
    const tracks = await this.database.tracks.find({ album: { $in: albumIds } });

    const imageIds = _.flatMap(tracks, 'images');
    const images = await this.database.images.find({ _id: { $in: imageIds } });

    return { albums, tracks, images };
  }

  /**
   * @param {string} _id
   */
  async albumById(_id) {
    return this.database.albums.findOne({ _id });
  }

  /**
   * @param {string} _id
   * @returns {Promise<?DbTrack>}
   */
  async trackById(_id) {
    return this.database.tracks.findOne({ _id });
  }

  /**
   * @param {number} album
   */
  async tracksByAlbum(album) {
    return this.database.tracks.findOne({ album });
  }

  /**
   * @param {InspectAlbum} album
   * @returns {Promise<DbAlbum>}
   */
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

      if (!doc) {
        throw new Error();
      }

      return doc;
    }

    return this.database.albums.insert(album);
  }

  /**
   * @param {InspectImage} image
   */
  async upsertImage(image) {
    if (image.blob) {
      const hash = crypto.createHash('sha1').update(image.blob).digest('hex');
      const dbimage = await this.database.images.findOne({ hash });

      if (dbimage) {
        return dbimage;
      }

      const file = path.join(this.configuration.imageDirectory, hash);
      await fs.writeFile(file, image.blob);

      return this.database.images.insert({
        path: file,
        hash,
        mimeType: image.mimeType,
      });
    }

    if (image.path) {
      return this.database.images.insert({
        path: image.path,
        hash: null,
        mimeType: image.mimeType,
      });
    }

    throw new Error();
  }

  /**
   * @param {object} options
   * @param {InspectFile} options.file
   * @param {InspectTrack} options.track
   * @param {InspectAlbum} options.album
   */
  async upsertTrack({ file, track, album }) {
    log(`upserting file ${file.path}`);

    /* file */
    const dbfile = await this.upsertFile(file);

    /* album */
    const dbalbum = await this.upsertAlbum(album);

    /* images */
    const images = track.images
      ? await promiseAll(track.images, image => this.upsertImage(image))
      : [];

    /** @type {DbTrack} */
    const dbtrack = {
      title: null,
      genre: null,
      number: null,
      offset: 0,
      ...track,
      images: _.map(images, '_id'),
      file: dbfile._id,
      album: dbalbum._id,
    };

    await this.database.tracks.insert(dbtrack);
    this.update$.next();
  }

  /**
   * @param {DbFile} dbfile
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
      const nAlbumTracks = await this.database.tracks.count({ album });

      if (nAlbumTracks === 0) {
        await this.database.files.remove({ _id: album });
      }
    }

    await this.database.files.remove({ _id: dbfile._id });
  }
}
