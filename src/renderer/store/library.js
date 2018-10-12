import _ from 'lodash';
import { observable } from 'mobx';
import backend from './backend';

function formAlbumList({ albums, tracks }) {
  const retAlbums = [];

  _.each(albums, (album) => {
    let retAlbum = _.find(retAlbums, {
      title: album.title,
      releaseDate: album.releaseDate,
    });

    if (!retAlbum) {
      retAlbum = {
        _id: [album.title, album.releaseDate].join('/'),
        title: album.title,
        releaseDate: album.releaseDate,
        originalDate: album.originalDate,
        duration: 0,
        discs: [],
      };

      retAlbums.push(retAlbum);
    }

    let retDisc = _.find(retAlbum.discs, { number: album.discNumber });

    if (!retDisc) {
      retDisc = {
        _id: album._id,
        number: album.discNumber,
        title: album.discTitle,
        images: album.images,
        duration: 0,
        tracks: [],
      };

      retAlbum.discs.push(retDisc);
    }
  });

  return _(retAlbums)
    .sortBy('releaseDate')
    .each((album) => {
      album.discs = _(album.discs)
        .sortBy('number')
        .each((disc) => {
          disc.tracks = _(tracks)
            .filter({ album: disc._id })
            .sortBy('number')
            .each((track) => {
              album.duration += track.duration;
              disc.duration += track.duration;
            });
        });
    });
}

class LibraryStore {
  @observable artists = []

  @observable artist = null

  @observable albums = []

  refreshArtists = async () => {
    this.artists = await backend.collection.artists();

    if (!this.artist && this.artists.length) {
      await this.changeArtist(this.artists[0]);
    }
  }

  changeArtist = async (artist) => {
    const result = await backend.collection.allOfArtist(artist);
    this.albums = formAlbumList(result);
    this.artist = artist;
  }

  rescan = async () => {
    await backend.scanner.update();
  }
}

export default new LibraryStore();
