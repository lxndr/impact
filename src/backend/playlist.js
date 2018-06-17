import _ from 'lodash';

export class Playlist {
  queue = []

  constructor(collection) {
    this.collection = collection;
  }

  async forArtist(artist) {
    const { albums, tracks } = await this.collection.allOfArtist(artist);

    const _albums = _.sortBy(albums, 'releaseDate');

    this.queue = tracks.sort((a, b) => {
      const ia = _.findIndex(_albums, { id: a.album });
      const ib = _.findIndex(_albums, { id: b.album });

      return ia === ib ?
        a.number - b.number :
        ia - ib;
    });
  }

  previous(currentTrack) {
    const count = this.queue.length;
    let nextIndex = count - 1;

    if (currentTrack) {
      const index = _.findIndex(this.queue, { id: currentTrack.id });

      if (index > 0) {
        nextIndex = index - 1;
      }
    }

    return this.queue[nextIndex] || null;
  }

  next(currentTrack) {
    const count = this.queue.length;
    let nextIndex = 0;

    if (currentTrack) {
      const index = _.findIndex(this.queue, { id: currentTrack.id });

      if (index > -1 && index < (count - 1)) {
        nextIndex = index + 1;
      }
    }

    return this.queue[nextIndex] || null;
  }
}
