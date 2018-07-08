import _ from 'lodash';
import debug from 'debug';

const log = debug('impact:collection');

export default class Collection {
  constructor(application) {
    this.database = application.database;
  }

  /**
   * Removes all data from the database.
   */
  async clear() {
    await this.database.tracks.remove({}, { multi: true });
    await this.database.albums.remove({}, { multi: true });
    await this.database.files.remove({}, { multi: true });
  }

  /**
   * @param {Object} file
   * @return {Number}
   */
  async upsertFile(file) {
    const dbfile = await this.database.files.get({ path: file.path });

    if (dbfile) {
      await this.database.files.update(dbfile.id, file);
      return dbfile.id;
    }

    return this.database.files.add(file);
  }

  async files() {
    const cursor = this.database.files.find({});
    const ff = await cursor;
    return this.database.files.find({});
  }

  async fileById(id) {
    return this.database.files.get(id);
  }

  async fileByPath(path) {
    return this.database.files.get({ path });
  }

  async artists() {
    const list = await this.database.albums.find({});

    return _(list)
      .map('artist')
      .uniq()
      .sort()
      .value();
  }

  async albumsByArtist(artist = '') {
    return this.database.albums.find({ artist });
  }

  async allOfArtist(artist) {
    const albums = await this.albumsByArtist(artist);
    const ids = _.map(albums, '_id');
    const tracks = await this.database.tracks.find({ album: { $in: ids } });
    return { albums, tracks };
  }

  async albumById(_id) {
    return this.database.albums.findOne({ _id });
  }

  async trackById(_id) {
    return this.database.tracks.findOne({ _id });
  }

  async tracks() {
    return this.database.tracks.find({});
  }

  async tracksByAlbum(album) {
    return this.database.tracks.findOne({ album });
  }

  async upsertTrack({ file, track, album }) {
    log(`upserting file ${file.path}`);

    const db = this.database;

    /* file */
    const fileId = await this.upsertFile(file);

    /* album */
    _.defaults(album, {
      artist: null,
      title: null,
      releaseDate: null,
      releaseType: null,
      discTitle: null,
      discNumber: 1,
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
    const dbalbum = await db.albums.find(q);
    const albumId = dbalbum ? dbalbum.id : await db.albums.add(album);

    /* track */
    _.defaults(track, {
      title: null,
      genre: null,
      number: null,
      offset: 0,
    });

    _.assign(track, {
      file: fileId,
      album: albumId,
    });

    const trackId = await this.database.tracks.update(track);

    return { fileId, albumId, trackId };
  }

  async removeFileById(_id) {
    return this.database.files.remove({ _id });
  }

  async removeFileByPath(path) {
    return this.database.files.remove({ path });
  }
}
