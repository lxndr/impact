import {inject} from '@lxndr/di';
import {BehaviorSubject} from 'rxjs';
import {Player} from './gst';
import {Collection} from './collection';

export class Playback {
  @inject(Collection) collection;
  track$ = new BehaviorSubject(null);
  state$ = new BehaviorSubject(null);
  player = null;
  queue = [];
  current = null;

  setup(track) {
    this.stop();

    this.player = new Player();
    this.player.onprogress = secs => {
      this.state$.next({
        state: 'playing',
        duration: this.player.duration,
        position: secs
      });
    };
    this.player.onend = () => {
      this.next();
    };
    this.player.onerror = error => {
      console.error(`Error: ${error.message}`);
    };
    this.player.uri = track.path;

    this.track$.next(track);
  }

  play(trackId) {
    this.collection.trackById(trackId).then(track => {
      this.setup(track);
      this.player.play();
    });

/*    this.setup(track);
    this.toggle();*/
  }

  toggle() {
    if (this.current === null && this.queue.length > 0) {
      this.current = 0;
    }

    if (this.current !== null) {
      const track = this.queue[this.current];
      this.setup(track);
      this.player.play();
    }
  }

  stop() {
    if (this.player) {
      this.player.stop();
      this.player = null;
      this.track$.next(null);
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

  async setupPlaylist(fnName, options) {
    for (const id of options) {
      const track = await this.collection.trackById(id);
      this.queue.push(track);
    }
  }
}
