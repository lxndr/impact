import {BehaviorSubject} from 'rxjs';
import {Player} from '@lxndr/gst';

export class Playback {
  _playlist = null

  player = null

  track$ = new BehaviorSubject(null)

  state$ = new BehaviorSubject(null).sampleTime(200)

  constructor(collection) {
    this.collection = collection;
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
      this.player.onprogress = null;
      this.player.onend = null;
      this.player.onerror = null;
      this.player = null;
      this.track$.next(null);
      this.state$.next(null);
    }
  }

  setup(track) {
    this.stop();

    this.player = new Player();

    this.player.onprogress = secs => {
      this.state$.next({
        state: this.player.state,
        duration: this.player.duration,
        position: secs
      });
    };

    this.player.onstatechange = state => {
      if (!this.player) {
        this.state$.next(null);
        return;
      }

      this.state$.next({
        state,
        duration: this.player.duration,
        position: this.player.position
      });
    };

    this.player.onend = () => {
      this.next();
    };

    this.player.onerror = error => {
      console.error(`Error: ${error.message}`);
    };

    this.player.uri = track.file.path;

    this.track$.next(track);
  }

  async _play(trackId) {
    this.stop();

    const track = await this.collection.trackById(trackId);

    if (!track) {
      return;
    }

    track.album = await this.collection.albumById(track.album);
    track.file = await this.collection.fileById(track.file);

    this.setup(track);
    this.player.play();
  }

  play(trackId) {
    this._play(trackId).catch(console.error);
  }

  toggle() {
    if (this.player) {
      if (this.state$.getValue().state === 'playing') {
        this.player.pause();
      } else {
        this.player.play();
      }
    }
  }

  previous() {
    const currentTrack = this.track$.getValue();
    const track = this.playlist.previous(currentTrack);
    this.play(track._id);
  }

  next() {
    const currentTrack = this.track$.getValue();
    const track = this.playlist.next(currentTrack);
    this.play(track._id);
  }

  seek(time) {
    if (this.player) {
      this.player.position = time;
    }
  }
}
