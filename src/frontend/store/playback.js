import { backend } from './backend';

export const playback = {
  track: null,
  state: null,

  /**
   * Computes track info for displaying.
   */
  get displayedTrack() {
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
  },

  play: async (track) => {
    const playlist = backend.createPlaylist();
    await playlist.forArtist(this.library.artist);
    backend.playback.playlist = playlist;
    backend.playback.play(track.id);
  },

  seek: (position) => {
  },

  next: () => {
  },

  prev: () => {
  },

  toggle: () => {
  },
};
