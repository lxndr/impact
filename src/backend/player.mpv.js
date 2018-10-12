import EventEmitter from 'events';
import { remote } from 'electron';

const { mpv } = remote.require('./main');

export default class Player extends EventEmitter {
  _uri = null

  _loaded = false

  _state = 'idle'

  _duration = 0

  _position = 0

  _positionSet = false

  _handleError = (error) => {
    this.emit('error', error);
  }

  constructor() {
    super();

    mpv.on('start-file', () => {
      this._loaded = true;

      if (this._positionSet) {
        this._positionSet = true;
        this._seek(this._position);
      }
    });

    mpv.on('end-file', () => {
      if (!this._loaded) return; // NOTE: prevets emitting 'end' after 'loadfile'
      this._loaded = false;
      this.emit('end');
    });

    mpv.observe('pause', (pause) => {
      this._state = pause ? 'pause' : 'playing';
      this.emit('state', this._state);
    });

    mpv.observe('duration', (secs) => {
      this._duration = secs;
    });

    mpv.observe('time-pos', (secs) => {
      this._position = secs;
      this.emit('position', secs);
    });
  }

  _seek(seconds) {
    mpv.command('seek', seconds, 'absolute').catch(this._handleError);
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
    this._position = seconds;
    this._positionSet = false;

    if (this._loaded) {
      this._positionSet = true;
      this._seek(this._position);
    }
  }

  get state() {
    return this._state;
  }

  play() {
    if (!this._loaded) {
      mpv.command('loadfile', this._uri).catch(this._handleError);
    }

    mpv.set('pause', false).catch(this._handleError);
  }

  pause() {
    mpv.set('pause', true).catch(this._handleError);
  }

  stop() {
    this.pause();
  }

  close() {
    this.removeAllListeners();
    this._uri = null;
  }
}
