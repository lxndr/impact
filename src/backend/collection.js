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

  async isEmpty() {
    const nTracks = await this.database.tracks.count({});
    return nTracks === 0;
  }

  /**
   * @param {Object} file
   * @return {Number}
   */
  async upsertFile(file) {
    const dbfile = await this.database.files.findOne({ path: file.path });

    if (dbfile) {
      const [, document] = await this.database.files.update(
        { _id: dbfile._id },
        file,
        { returnUpdatedDocs: true },
      );

      return document;
    }

    return this.database.files.insert(file);
  }

  async files() {
    return this.database.files.find({});
  }

  async fileById(_id) {
    return this.database.files.findOne({ _id });
  }

  async fileByPath(path) {
    return this.database.files.findOne({ path });
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
      const [, document] = await this.database.albums.update(
        { _id: dbalbum._id },
        dbalbum,
        { returnUpdatedDocs: true },
      );

      return document;
    }

    return this.database.albums.insert(album);
  }

  async upsertTrack({ file, track, album }) {
    log(`upserting file ${file.path}`);

    /* file */
    file = await this.upsertFile(file);

    /* album */
    album = await this.upsertAlbum(album);

    /* track */
    _.defaults(track, {
      title: null,
      genre: null,
      number: null,
      offset: 0,
    });

    _.assign(track, {
      file: file._id,
      album: album._id,
    });

    track = await this.database.tracks.insert(track);
    return { file, album, track };
  }

  async removeFileById(_id) {
    return this.database.files.remove({ _id });
  }

  async removeFileByPath(path) {
    return this.database.files.remove({ path });
  }
}
