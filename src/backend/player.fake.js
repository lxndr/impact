import { EventEmitter } from 'events';

export class Player extends EventEmitter {
  _uri = null

  _position = 0

  _state = 'stopped'

  get uri() {
    return this._uri;
  }

  set uri(file) {
    this._uri = file;
  }

  get duration() {
    return 1;
  }

  get position() {
    return this._position;
  }

  set position(seconds) {
    this._position = seconds;
  }

  get state() {
    return this._state;
  }

  play() {
    this._state = 'playing';
  }

  pause() {
    this._state = 'paused';
  }

  stop() {
    this._state = 'stopped';
  }

  close() {
  }
}
