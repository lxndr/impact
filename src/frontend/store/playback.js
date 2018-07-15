import { observable, computed } from 'mobx';
import backend from './backend';
import library from './library';

class PlaybackStore {
  @observable track = null

  @observable state = null

  constructor() {
    backend.playback.track$.subscribe((track) => {
      this.track = track;
    });

    backend.playback.state$.subscribe((state) => {
      this.state = state;
    });
  }

  /**
   * Computes track info for displaying.
   */
  @computed get displayedTrack() {
    if (!this.track) {
      return {
        title: '',
        album: '',
        duration: 0,
      };
    }

    const artist = this.track.album.artist || 'Unknown artist';
    const album = this.track.album.title || 'Unknown album';

    return {
      title: this.track.title || 'Unknown title',
      album: `by ${artist} from ${album}`,
      duration: this.track.duration,
    };
  }

  play = async (track) => {
    const playlist = backend.createPlaylist();
    await playlist.forArtist(library.artist);
    backend.playback.playlist = playlist;
    backend.playback.play(track._id);
  }

  seek = (position) => {
    backend.playback.seek(position);
  }

  next = () => {
    backend.playback.next();
  }

  prev = () => {
    backend.playback.prev();
  }

  toggle = () => {
    backend.playback.toggle();
  }
}

export default new PlaybackStore();
