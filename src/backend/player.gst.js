import { EventEmitter } from 'events';
import { GstPlayer } from '@lxndr/gst';

export default class Player extends EventEmitter {
  _player = new GstPlayer()

  _uri = null

  _state = 'stopped'

  _position = 0

  constructor() {
    super();

    this._player.onstate = (state) => {
      if (state === 3) {
        this._player.seek((this._position * 1000000000) / this.duration);
      }

      const states = ['stopped', 'buffering', 'paused', 'playing'];
      this._state = states[state];
      this.emit('state', this._state);
    };

    this._player.onend = () => {
      this._state = 'stopped';
      this.emit('end');
    };

    this._player.onposition = (ns) => {
      this._position = ns / 1000000000;
      this.emit('position', this._position);
    };

    this._player.onerror = (error) => {
      this.emit('error', error);
    };
  }

  get uri() {
    return this._uri;
  }

  set uri(file) {
    this._uri = file;

    if (file) {
      this._player.uri = `file://${file}`;
    }
  }

  get duration() {
    return this._player.duration;
  }

  get position() {
    return this._position;
  }

  set position(seconds) {
    this._position = seconds;
    this._player.seek(seconds * 1000000000);
  }

  get state() {
    return this._state;
  }

  play() {
    this._player.play();
  }

  pause() {
    this._player.pause();
  }

  stop() {
    this._player.stop();
  }

  close() {
    this.removeAllListeners();
    this._uri = null;
    this._player.close();
  }
}
