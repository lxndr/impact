import { BehaviorSubject } from 'rxjs';
import Player from './player.vlc';

export default class Playback {
  _playlist = null

  player = new Player()

  track$ = new BehaviorSubject(null)

  state$ = new BehaviorSubject(null)

  constructor(application) {
    this.collection = application.collection;

    this.player.on('position', (time) => {
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

    this.player.on('error', (error) => {
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

  _setup(track) {
    if (this.player.uri !== track.file.path) {
      this.player.uri = track.file.path;
    }

    this.player.position = track.offset;
    this.track$.next(track);
  }

  async _play(trackId) {
    const track = await this.collection.trackById(trackId);

    if (!track) {
      return;
    }

    track.album = await this.collection.albumById(track.album);
    track.file = await this.collection.fileById(track.file);

    this._setup(track);
    this.player.play();
  }

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
    const currentTrack = this.track$.getValue();
    const track = this.playlist.previous(currentTrack);
    this.play(track.id);
  }

  next() {
    const currentTrack = this.track$.getValue();
    const track = this.playlist.next(currentTrack);
    this.play(track.id);
  }

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
