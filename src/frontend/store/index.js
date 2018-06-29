import { Application } from '../../backend';

// import { libraryReducer, librarySaga } from './library';
// import { configReducer } from './config';
// import { coreSaga } from './core';
import { PlaybackStore } from './playback';
import { WindowStore } from './window';

// export * from './config';
// export * from './core';
// export * from './library';

export const backend = new Application();

export const store = {
  notifications: {},
  config: {},
  library: {},
  playback: new PlaybackStore(),
  window: new WindowStore(),

  async init() {
    try {
      await backend.startup();
    } catch (err) {
      this.notifications.error(err);
    }
  },
};
