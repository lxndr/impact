import { BehaviorSubject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

/**
 * @typedef {import('common/types').PlaybackTrack} PlaybackTrack
 * @typedef {import('common/types').Player} Player
 * @typedef {import('./collection').default} Collection
 */

/**
 * @typedef {Object} PlaybackState
 * @property {string} state
 * @property {number} duration
 * @property {number} position
 */

export default class Playback {
  _playlist = null

  /** @type {BehaviorSubject<?PlaybackTrack>} */
  track$ = new BehaviorSubject(null)

  /** @type {BehaviorSubject<?PlaybackState>} */
  state$ = new BehaviorSubject(null).pipe(throttleTime(250))

  /**
   * @param {Object} options
   * @param {Collection} options.collection
   * @param {Player} options.player
   */
  constructor({ collection, player }) {
    this.collection = collection;
    this.player = player;

    this.player.on('position', (/** @type {number} */ time) => {
      const track = this.track$.getValue();

      if (!track) {
        return;
      }

      if (time > (track.offset + track.duration)) {
        this.next();
        return;
      }

      this.state$.next({
        state: this.player.state,
        duration: track.duration,
        position: time - track.offset,
      });
    });

    this.player.on('state', () => {
      const track = this.track$.getValue();
      let state = null;

      if (track) {
        state = {
          state: this.player.state,
          duration: track.duration,
          position: this.player.position - track.offset,
        };
      }

      this.state$.next(state);
    });

    this.player.on('end', () => {
      this.next();
    });

    this.player.on('error', (/** @type {Error} */ error) => {
      console.error(`Error: ${error.message}`);
    });
  }

  set playlist(pl) {
    if (pl === this._playlist) {
      return;
    }

    this.stop();
    this._playlist = pl;
  }

  get playlist() {
    return this._playlist;
  }

  stop() {
    if (this.player) {
      this.player.stop();
      this.track$.next(null);
      this.state$.next(null);
    }
  }

  /**
   * @param {PlaybackTrack} track
   */
  _setup(track) {
    if (this.player.uri !== track.file.path) {
      this.player.uri = track.file.path;
    }

    this.player.position = track.offset;
    this.track$.next(track);
  }

  /**
   * @param {string} trackId
   */
  async _play(trackId) {
    const track = await this.collection.trackById(trackId);

    if (!track) {
      return;
    }

    const album = await this.collection.albumById(track.album);

    if (!album) {
      throw new Error(`Could not find album ${track.album}`);
    }

    const file = await this.collection.fileById(track.file);

    if (!file) {
      throw new Error(`Could not find file ${track.file}`);
    }

    this._setup({
      ...track,
      album,
      file,
    });

    this.player.play();
  }

  /**
   * @param {string} trackId
   */
  play(trackId) {
    this._play(trackId).catch(console.error);
  }

  toggle() {
    if (this.player) {
      const state = this.state$.getValue();
      if (state && state.state === 'playing') {
        this.player.pause();
      } else {
        this.player.play();
      }
    }
  }

  previous() {
    if (!this.playlist) return;
    const currentTrack = this.track$.getValue();
    const track = this.playlist.previous(currentTrack);
    this.play(track._id);
  }

  next() {
    if (!this.playlist) return;
    const currentTrack = this.track$.getValue();
    const track = this.playlist.next(currentTrack);
    this.play(track._id);
  }

  /**
   * @param {number} time
   */
  seek(time) {
    const track = this.track$.getValue();

    if (track) {
      this.player.position = track.offset + time;
    }
  }

  close() {
    this.player.close();
  }
}
