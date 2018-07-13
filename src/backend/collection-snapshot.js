import _ from 'lodash';
import { upsert } from './utils';

export default class CollectionSnapshot {
  files = []

  albums = []

  static async forFile(collection, file) {
    const self = new CollectionSnapshot();

    file = await collection.fileById(file.id);

    if (file) {
      self.files.push(file);
    }

    /* get all related files */
    for (const { rels } of self.files) {
      for (const id of rels) {
        if (_.find(self.files, { id })) continue;
        const nfile = await collection.fileById(id);
        self.files.push(nfile);
      }
    }

    const tracks = _.flatten(
      await Promise.all(
        self.files.map(file => collection.tracksByFile(file.id)),
      ),
    );

    self.albums = await Promise.all(
      _.uniqBy(tracks, 'id').map(track => collection.albumById(track.id)),
    );

    return self;
  }

  add(data) {
    switch (data.type) {
      case 'media': this.addMedia(data); break;
      case 'index': this.addIndex(data); break;
      default: break;
    }
  }

  addFile(file) {
    return upsert(this.files, 'path', file);
  }

  addAlbum(album) {
    const xalbum = _.defaults({}, album, {
      artist: null,
      title: null,
      releaseDate: null,
      releaseType: null,
      discTitle: null,
      discNumber: 1,
      tracks: [],
    });

    if (!xalbum.title) {
      _.assign(xalbum, {
        releaseDate: null,
        releaseType: null,
        discTitle: null,
        discNumber: null,
      });
    }

    const keys = ['artist', 'title', 'releaseDate', 'discNumber', 'discTitle'];
    return upsert(this.albums, keys, xalbum);
  }

  addTrack(album, track) { // eslint-disable-line class-methods-use-this
    return upsert(album.tracks, 'title', track);
  }

  /**
   *
   */
  addMedia({ file, album, track }) {
    const xfile = this.addFile(file);
    const xalbum = this.addAlbum(album);
    const xtrack = { ...track, file: xfile };
    this.addTrack(xalbum, xtrack);
  }

  /**
   *
   */
  addIndex({ index, albums }) {
    const xindex = this.addFile(index);
    const rels = [];

    for (const album of albums) {
      const xalbum = this.addAlbum(album);

      for (const { file, ...track } of album.tracks) {
        const xfile = this.addFile(file);
        const xtrack = this.addTrack(xalbum, track);
        xtrack.rels = [xfile];
      }
    }

    xindex.rels = _.uniq(rels);
  }
}
