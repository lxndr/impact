import EventEmitter from 'events';

/**
 * @typedef {import('@lxndr/mpv')} Mpv
 * @typedef {import('common/types').Player} Player
 */

/**
 * @implements {Player}
 */
export default class MpvPlayer extends EventEmitter {
  /** @type {?string} */
  _uri = null

  /** @type {boolean} */
  _loaded = false

  /** @type {string} */
  _state = 'idle'

  /** @type {number} */
  _duration = 0

  /** @type {number} */
  _position = 0

  /** @type {?number} */
  _pendingPosition = null

  /**
   * @param {Error} error
   */
  _handleError = (error) => {
    this.emit('error', error);
  }

  /**
   * @param {Mpv} options
   */
  constructor({ mpv }) {
    super();
    this.mpv = mpv;

    this.mpv.on('start-file', () => {
      this._loaded = true;

      if (this._pendingPosition !== null) {
        if (this._pendingPosition > 0) {
          this._seek(this._pendingPosition);
          this._position = this._pendingPosition;
        }

        this._pendingPosition = null;
      }
    });

    this.mpv.on('end-file', () => {
      if (!this._loaded) return; // NOTE: prevets emitting 'end' after 'loadfile'
      this._loaded = false;
      this._position = 0;
      this.emit('end');
    });

    this.mpv.observe('pause', (/** @type {boolean} */ pause) => {
      this._state = pause ? 'pause' : 'playing';
      this.emit('state', this._state);
    });

    this.mpv.observe('duration', (/** @type {number} */ secs) => {
      this._duration = secs;
    });

    this.mpv.observe('time-pos', (/** @type {number} */ secs) => {
      this._position = secs;
      this.emit('position', secs);
    });
  }

  /**
   * @param {number} seconds
   */
  _seek(seconds) {
    this.mpv.command('seek', seconds, 'absolute').catch(this._handleError);
  }

  get uri() {
    return this._uri;
  }

  set uri(file) {
    if (file === this._uri) return;
    this._uri = file;
    this._loaded = false;
  }

  get duration() {
    return this._duration;
  }

  get position() {
    return this._position;
  }

  set position(seconds) {
    if (this._loaded) {
      this._pendingPosition = null;
      this._position = seconds;
      this._seek(seconds);
    } else {
      this._pendingPosition = seconds;
    }
  }

  get state() {
    return this._state;
  }

  play() {
    if (!this._loaded) {
      this.mpv.command('loadfile', this._uri).catch(this._handleError);
    }

    this.mpv.set('pause', false).catch(this._handleError);
  }

  pause() {
    this.mpv.set('pause', true).catch(this._handleError);
  }

  stop() {
    this.pause();
  }

  close() {
    this.removeAllListeners();
    this._uri = null;
  }
}
