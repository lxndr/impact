import _ from 'lodash';

/**
 * @typedef {import('common/types').Track} Track
 */

export default class Playlist {
  /** @type {Track[]} */
  queue = []

  constructor({ collection }) {
    this.collection = collection;
  }

  /**
   * @param {Track[]} tracks
   */
  forTracks(tracks) {
    this.queue = tracks;
  }

  /**
   * @param {Track} currentTrack
   */
  previous(currentTrack) {
    const count = this.queue.length;
    let nextIndex = count - 1;

    if (currentTrack) {
      const index = _.findIndex(this.queue, { _id: currentTrack._id });

      if (index > 0) {
        nextIndex = index - 1;
      }
    }

    return this.queue[nextIndex] || null;
  }

  /**
   * @param {Track} currentTrack
   */
  next(currentTrack) {
    const count = this.queue.length;
    let nextIndex = 0;

    if (currentTrack) {
      const index = _.findIndex(this.queue, { _id: currentTrack._id });

      if (index > -1 && index < (count - 1)) {
        nextIndex = index + 1;
      }
    }

    return this.queue[nextIndex] || null;
  }
}
