import os from 'os';
import EventEmitter from 'events';
import MPV from '@lxndr/mpv';

function mpvExecutable() {
  switch (os.platform()) {
    case 'win32':
      return 'node_modules/@lxndr/mpv/bin/win32/mpv.exe';
    default:
      return 'mpv';
  }
}

export default class Player extends EventEmitter {
  _mpv = new MPV({ exec: mpvExecutable() })

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

    this._mpv.on('start-file', () => {
      this._loaded = true;

      if (this._positionSet) {
        this._positionSet = true;
        this._seek(this._position);
      }
    });

    this._mpv.on('end-file', () => {
      this._loaded = false;
      this.emit('end');
    });

    this._mpv.observe('pause', (pause) => {
      this._state = pause ? 'pause' : 'playing';
      this.emit('state', this._state);
    });

    this._mpv.observe('duration', (secs) => {
      this._duration = secs;
    });

    this._mpv.observe('time-pos', (secs) => {
      this._position = secs;
      this.emit('position', secs);
    });
  }

  _seek(seconds) {
    this._mpv.command('seek', seconds, 'absolute').catch(this._handleError);
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
      this._mpv.command('loadfile', this._uri).catch(this._handleError);
    }

    this._mpv.set('pause', false).catch(this._handleError);
  }

  pause() {
    this._mpv.set('pause', true).catch(this._handleError);
  }

  stop() {
    this.pause();
  }

  close() {
    this.removeAllListeners();
    this._uri = null;
    this._mpv.close();
  }
}
