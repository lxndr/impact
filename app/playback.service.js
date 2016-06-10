import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import av from 'av';
import 'flac.js';

@Injectable()
export class PlaybackService {
  player = null;
  queue = [];
  current = null;
  player = null;

  _trackSubject = new BehaviorSubject();
  track$ = this._trackSubject.asObservable();
  _progressSubject = new BehaviorSubject();
  progress$ = this._progressSubject.asObservable();

  toggle() {
    if (this.current === null && this.queue.length > 0) {
      this.current = 0;
    }

    if (!this.player && this.current !== null) {
      const track = this.queue[this.current];
      if (track !== null) {
        this._trackSubject.next(track);
        this.player = av.Player.fromFile(track.file);
        this.player.on('progress', msecs => {
          this._progressSubject.next({
            duration: track.duration,
            progress: msecs / 1000
          });
        });
        this.player.on('end', () => {
          this.next();
        });
      }
    }

    if (this.player) {
      this.player.togglePlayback();
    }
  }

  stop() {
    if (this.player) {
      this.player.stop();
      this.player = null;
      this._trackSubject.next(null);
    }
  }

  previous() {
    this.stop();

    if (this.current >= 0) {
      this.current--;
    }

    this.toggle();
  }

  next() {
    this.stop();

    if (this.current < this.queue.length) {
      this.current++;
    }

    this.toggle();
  }

  clean() {
    this.stop();
    this.current = null;
    this.queue = [];
  }

  addTrack(track) {
    this.queue.push(track);
  }

  addTracks(tracks) {
    this.queue.push(...tracks);
  }
}
