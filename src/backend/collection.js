import _ from 'lodash';
import debug from 'debug';
import invariant from 'invariant';

/*

Schemas:

  files:
    id
    path
    mtime

  tracks
    id
    title
    number
    album
    duration
    file
    ?offset

  albums
    id
    title
    artist
    date
    releaseDate
    artwork
      name
      path

*/

const log = debug('impact:collection');

export class Collection {
  constructor(application) {
    this.database = application.database;
  }

  async clear() {
    await this.database.tracks.clear();
    await this.database.albums.clear();
    await this.database.files.clear();
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
    return this.database.files.toArray();
  }

  async fileById(id) {
    return this.database.files.get(id);
  }

  async fileByPath(path) {
    return this.database.files.get({ path });
  }

  async artists() {
    return this.database.albums.orderBy('artist').uniqueKeys();
  }

  async albumsByArtist(artist) {
    artist = artist || '';
    return this.database.albums.where({ artist }).toArray();
  }

  async allOfArtist(artist) {
    const albums = await this.albumsByArtist(artist);
    const ids = _.map(albums, 'id');
    const tracks = await this.database.tracks.where('album').anyOf(ids).toArray();
    return { albums, tracks };
  }

  async albumById(id) {
    return this.database.albums.get(id);
  }

  async trackById(id) {
    return this.database.tracks.get(id);
  }

  async tracks() {
    return this.database.tracks.toArray();
  }

  async tracksByAlbum(album) {
    return this.database.tracks.get({ album });
  }

  async upsertTrack({ file, track, album }) {
    log(`upserting file ${file.path}`);

    const db = this.database;

    return db.transaction('rw', db.files, db.albums, db.tracks, async () => {
      /* file */
      const fileId = await this.upsertFile(file);

      /* album */
      if (!album.title) {
        _.assign(album, {
          releaseDate: null,
          releaseType: null,
          discTitle: null,
          discNumber: null,
        });
      }

      const defaultAlbum = {
        artist: '',
        title: '',
        releaseDate: '',
        releaseType: null,
        discTitle: '',
        discNumber: 1,
      };

      _.assignWith(album, defaultAlbum, (objValue, srcValue) => (_.isNil(objValue) ? srcValue : objValue));

      const q = _.pick(album, ['artist', 'title', 'releaseDate', 'discNumber', 'discTitle']);
      const dbalbum = await db.albums.get(q);
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

      const trackId = await this.database.tracks.put(track);

      return { fileId, albumId, trackId };
    });
  }

  async removeFile({ file, dbfile }) {
    invariant(file || dbfile, 'file or dbfile must be specified');

    if (!dbfile) {
      dbfile = await this.fileByPath(file);
    }

    await this.database.files.delete(dbfile.id);
  }
}
