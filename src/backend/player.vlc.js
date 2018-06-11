import {EventEmitter} from 'events';
import {VlcMedia, VlcMediaPlayer} from '@lxndr/vlc';

/*
 * NOTE:
 *   1. VlcMediaPlayer.time can't be set when the player is not playing.
 */

export class Player extends EventEmitter {
  _player = new VlcMediaPlayer()

  _uri = null

  _state = 'idle'

  _time = 0

  constructor() {
    super();

    this._player.onplay = () => {
      this._player.position = (this._time * 1000) / this.duration;
      this._state = 'playing';
      this.emit('state', this._state);
    };

    this._player.onpause = () => {
      this._state = 'pause';
      this.emit('state', this._state);
    };

    this._player.onstop = () => {
      this._state = 'stop';
      this.emit('state', this._state);
    };

    this._player.onend = () => {
      this.emit('end');
    };

    this._player.ontime = ms => {
      this._time = ms / 1000;
      this.emit('position', this._time);
    };

    this._player.onerror = () => {
      console.error('ERROR');
    };
  }

  get uri() {
    return this._uri;
  }

  set uri(file) {
    if (this._player.media) {
      this._player.media.close();
      this._player.media = null;
      this._uri = null;
    }

    if (file) {
      this._uri = file;
      this._player.media = new VlcMedia('file://' + file);
    }
  }

  get duration() {
    return (this._player.length >= 0) ? this._player.length : 0;
  }

  get position() {
    return this._time;
  }

  set position(seconds) {
    this._time = seconds;
    this._player.time = seconds * 1000;
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
