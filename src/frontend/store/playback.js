import { observable, computed } from 'mobx';
import { backend } from '.';

export class PlaybackStore {
  @observable track = null

  @observable state = null

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
    backend.playback.play(track.id);
  }

  seek = (position) => {
  }

  next = () => {
  }

  prev = () => {
  }

  toggle = () => {
  }
}
