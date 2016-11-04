import {Player} from './gst';

export class Playback {
  player = null;
  queue = [];
  current = null;

  setup(track) {
    if (this.player) {
      this.player.stop();
    }

    this.player = new Player();
    this.player.onprogress = msecs => {
      const time = {
        duration: track.duration,
        progress: msecs / 1000
      };
    };
    this.player.onend = () => {
      this.next();
    };
    this.player.onerror = error => {
      console.error(`Error: ${error.message}`);
    };
    this.player.uri = track.file;
  }

  toggle() {
    if (this.current === null && this.queue.length > 0) {
      this.current = 0;
    }

    if (!this.player && this.current !== null) {
      const track = this.queue[this.current];
      if (track !== null) {
        this._trackSubject.next(track);
      }
    }

    if (this.player) {
      this.player.pause = !this.player.pause;
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

  play(track) {
    if (this.player) {
      this.player.stop();
      this.player = null;
    }

    this.player = new Player();
    this.player.onend = () => {
      console.log('Finished');
    };
    this.player.onerror = error => {
      console.error(`Error: ${error.message}`);
    };
    this.player.uri = track.path;
    this.player.play();
  }
}
