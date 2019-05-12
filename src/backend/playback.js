import { Subject, BehaviorSubject } from 'rxjs';

/**
 * @typedef {import('common/types').Track} Track
 * @typedef {import('common/types').Player} Player
 * @typedef {import('./library').default} Library
 * @typedef {import('./playlist').default} Playlist
 */

export default class Playback {
  /**
   * @type {Playlist?}
   * @private
   */
  _playlist = null

  /** @type {BehaviorSubject<Track?>} */
  track$ = new BehaviorSubject(null)

  /** @type {BehaviorSubject<string>} */
  state$ = new BehaviorSubject('stopped')

  /** @type {BehaviorSubject<number>} */
  position$ = new BehaviorSubject(0)

  /** @type {Subject<Error>} */
  error$ = new Subject()

  /**
   * @param {object} options
   * @param {Library} options.library
   * @param {Player} options.player
   */
  constructor({ library, player }) {
    this.library = library;
    this.player = player;

    this.player.on('position', (/** @type {number} */ time) => {
      const track = this.track$.value;

      if (!track) {
        return;
      }

      if (time > (track.offset + track.duration)) {
        this.next();
        return;
      }

      const trackPosition = time - track.offset;
      this.position$.next(trackPosition);
    });

    this.player.on('state', (/** @type {string} */ state) => {
      this.state$.next(state);
    });

    this.player.on('end', () => {
      this.next();
    });

    this.player.on('error', (/** @type {Error} */ error) => {
      this.error$.next(error);
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
      this.state$.next('stopped');
      this.position$.next(0);
    }
  }

  /**
   * @param {Track} track
   */
  _setup(track) {
    if (this.player.uri !== track.file.path) {
      this.player.uri = track.file.path;
    }

    this.player.position = track.offset;
    this.track$.next(track);
  }

  /**
   * @param {Track} track
   */
  async _play(track) {
    this._setup(track);
    this.player.play();
  }

  /**
   * @param {Track} track
   */
  play(track) {
    this._play(track).catch((error) => {
      this.error$.next(error);
    });
  }

  toggle() {
    if (this.player) {
      if (this.state$.value === 'playing') {
        this.player.pause();
      } else {
        this.player.play();
      }
    }
  }

  previous() {
    if (!this.playlist) return;
    const currentTrack = this.track$.value;

    if (currentTrack) {
      const track = this.playlist.previous(currentTrack);
      this.play(track);
    }
  }

  next() {
    if (!this.playlist) return;
    const currentTrack = this.track$.value;

    if (currentTrack) {
      const track = this.playlist.next(currentTrack);
      this.play(track);
    }
  }

  /**
   * @param {number} time
   */
  seek(time) {
    const track = this.track$.value;

    if (track) {
      this.player.position = track.offset + time;
    }
  }

  close() {
    this.player.close();
  }
}
