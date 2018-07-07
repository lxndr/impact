import backend from './backend';
import libraryStore from './library';
import playbackStore from './playback';
import windowStore from './window';

class Store {
  config = {
    language: 'en',
  }

  library = libraryStore

  playback = playbackStore

  window = windowStore

  init = async () => {
    await backend.startup();
    await this.library.refreshArtists();
  }
}

export default new Store();
