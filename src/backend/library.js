import R from 'ramda';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import debug from 'debug';
import { Subject } from 'rxjs';
import promiseAll from 'p-map';
import formAlbumList from './library.albums';
import { onlyUnique, defaults } from './utils';

/**
 * @typedef {import('rxjs').Observable} Observable
 * @typedef {import('common/types').InspectFile} InspectFile
 * @typedef {import('common/types').InspectImage} InspectImage
 * @typedef {import('common/types').InspectAlbum} InspectAlbum
 * @typedef {import('common/types').InspectTrack} InspectTrack
 * @typedef {import('common/types').Id} Id
 * @typedef {import('common/types').DbFile} DbFile
 * @typedef {import('common/types').DbTrack} DbTrack
 * @typedef {import('common/types').DbAlbum} DbAlbum
 * @typedef {import('common/types').NewDbTrack} NewDbTrack
 * @typedef {import('common/types').NewDbAlbum} NewDbAlbum
 * @typedef {import('common/types').Track} Track
 * @typedef {import('./configuration').default} Configuration
 * @typedef {import('./database').default} Database
 */

const log = debug('impact:library');

export default class Library {
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
   *
   */
  async correct() {
    await this.correctIndexedTracks();
    await this.correctTracks();
    await this.correctEmtpyAlbums();
    this.update$.next();
  }

  async correctIndexedTracks() {
    const tracksWithIndex = await this.database.tracks.find({ index: { $ne: null } });
    const fileIds = tracksWithIndex.map(R.prop('file')).filter(onlyUnique);

    const nRemoved = await this.database.tracks.remove({
      file: { $in: fileIds },
      index: null,
    }, { multi: true });

    log(`${nRemoved} tracks removed.`);
  }

  async correctTracks() {
    const files = await this.database.files.find({});
    const fileIds = files.map(R.prop('_id'));

    const nRemoved = await this.database.tracks.remove({
      $or: [
        { file: null },
        { file: { $nin: fileIds } },
        {
          $and: [
            { index: { $ne: null } },
            { index: { $nin: fileIds } },
          ],
        },
      ],
    }, { multi: true });

    log(`${nRemoved} tracks removed.`);
  }

  async correctEmtpyAlbums() {
    const albums = await this.database.albums.find();

    for (const album of albums) {
      const nTracks = await this.database.tracks.count({ album: album._id });

      if (nTracks === 0) {
        await this.database.albums.remove({ _id: album._id });
        log(`Album '${album.title}' has been removed becasue it was empty`);
      }
    }
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
    const albums = await this.database.albums.find();
    return albums
      .map(R.prop('artist'))
      .filter(onlyUnique)
      .sort(R.ascend(R.identity));
  }

  /**
   * @param {?string} artist
   */
  async albumsByArtist(artist) {
    const dbalbums = await this.database.albums.find({ artist });

    const albumIds = dbalbums.map(R.prop('_id'));
    const dbtracks = await this.database.tracks.find({ album: { $in: albumIds } });

    const albumImageIds = dbalbums.flatMap(R.prop('images'));
    const trackImageIds = dbtracks.flatMap(R.prop('images'));
    const imageIds = R.uniq([...albumImageIds, ...trackImageIds]);
    const dbimages = await this.database.images.find({ _id: { $in: imageIds } });

    const mediaIds = dbtracks.map(R.prop('file'));
    const indexIds = dbtracks.map(R.prop('index'));
    const fileIds = R.uniq([...mediaIds, ...indexIds]);
    const dbfiles = await this.database.files.find({ _id: { $in: fileIds } });

    return formAlbumList({
      dbalbums,
      dbtracks,
      dbimages,
      dbfiles,
    });
  }

  /**
   * @param {InspectAlbum} album
   * @returns {Promise<DbAlbum>}
   */
  async upsertAlbum({ tracks, ...album }) {
    const images = album.images
      ? await promiseAll(album.images, image => this.upsertImage(image))
      : [];

    /** @type {NewDbAlbum} */
    const newAlbum = defaults({
      ...album,
      images: images.map(R.prop('_id')),
    }, {
      artist: null,
      title: null,
      originalDate: null,
      releaseDate: null,
      releaseType: 'album',
      edition: null,
      publisher: null,
      catalogId: null,
      discTitle: null,
      discNumber: 1,
    });

    if (!newAlbum.releaseDate) {
      newAlbum.releaseDate = newAlbum.originalDate;
    }

    const query = R.pick([
      'artist',
      'title',
      'releaseDate',
      'edition',
      'discNumber',
      'discTitle',
      'publisher',
      'catalogId',
    ], newAlbum);

    const existingAlbum = await this.database.albums.findOne(query);

    if (existingAlbum) {
      const { doc } = await this.database.albums.update(
        { _id: existingAlbum._id },
        newAlbum,
        { returnUpdatedDocs: true },
      );

      if (!doc) {
        throw new Error();
      }

      return doc;
    }

    return this.database.albums.insert(newAlbum);
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
      const dbimage = await this.database.images.findOne({ path: image.path });

      if (dbimage) {
        return dbimage;
      }

      return this.database.images.insert({
        path: image.path,
        hash: null,
        mimeType: image.mimeType,
      });
    }

    throw new Error();
  }

  /**
   * @param {InspectTrack} track
   * @param {InspectAlbum} album
   */
  async upsertTrack({ file, index, ...track }, album) {
    log(`upserting file ${file.path}`);

    /* file */
    const dbfile = await this.upsertFile(file);

    /* index */
    const dbindex = index ? await this.upsertFile(index) : null;

    /* album */
    const dbalbum = await this.upsertAlbum(album);

    /* images */
    const images = track.images
      ? await promiseAll(track.images, image => this.upsertImage(image))
      : [];

    /** @type {NewDbTrack} */
    const dbtrack = defaults({
      ...track,
      images: images.map(R.prop('_id')),
      file: dbfile._id,
      index: dbindex ? dbindex._id : null,
      album: dbalbum._id,
    }, {
      title: null,
      artists: [],
      genre: null,
      number: null,
      offset: 0,
    });

    await this.database.tracks.insert(dbtrack);
    this.update$.next();
  }

  /**
   * @param {DbFile} dbfile
   */
  async removeFile(dbfile) {
    await this.database.files.remove({ _id: dbfile._id });
  }
}
