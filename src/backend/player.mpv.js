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

  _state = 'idle'

  _duration = 0

  _position = 0

  _handleError = (error) => {
    this.emit('error', error);
  }

  constructor() {
    super();

    this._mpv.on('end-file', () => {
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

  async _setUri(uri) {
    await this._mpv.command('loadfile', uri);
    await this._mpv.set('pause', true);
    this._uri = uri;
  }

  get uri() {
    return this._uri;
  }

  set uri(file) {
    this._setUri(file).catch(this._handleError);
  }

  get duration() {
    return this._duration;
  }

  get position() {
    return this._position;
  }

  set position(seconds) {
    // this._mpv.command('seek', seconds).catch(this._handleError);
  }

  get state() {
    return this._state;
  }

  play() {
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
