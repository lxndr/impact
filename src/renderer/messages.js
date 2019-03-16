import { defineMessages } from 'react-intl';

export default {
  generic: defineMessages({
    back: {
      id: 'generic.back',
      defaultMessage: 'Back',
    },
    save: {
      id: 'generic.save',
      defaultMessage: 'Save',
    },
  }),
  library: defineMessages({
    unknownTrack: {
      id: 'library.unknownTrack',
      defaultMessage: 'Unknown track',
    },
    unknownArtist: {
      id: 'library.unknownArtist',
      defaultMessage: 'Unknown artist',
    },
    unknownAlbum: {
      id: 'library.unknownAlbum',
      defaultMessage: 'Unknown album',
    },
  }),
  emptyLibrary: defineMessages({
    message: {
      id: 'emptyLibary.rmessage',
      defaultMessage: 'Your library is empty. You need to specify path to your music collection in {link}',
    },
    link: {
      id: 'emptyLibrary.link',
      defaultMessage: 'the preferences',
    },
  }),
  playback: defineMessages({
    prev: {
      id: 'playback.prev',
      defaultMessage: 'Previous track',
    },
    play: {
      id: 'playback.play',
      defaultMessage: 'Play',
    },
    pause: {
      id: 'playback.pause',
      defaultMessage: 'Puase',
    },
    next: {
      id: 'playback.next',
      defaultMessage: 'Next track',
    },
    fromAlbum: {
      id: 'playback.fromAlbum',
      defaultMessage: 'by {artist} from {album}',
    },
  }),
  window: defineMessages({
    minimize: {
      id: 'window.minimize',
      defaultMessage: 'Minimize window',
    },
    maximize: {
      id: 'window.maximize',
      defaultMessage: 'Maximize window',
    },
    close: {
      id: 'window.close',
      defaultMessage: 'Close',
    },
    preferences: {
      id: 'window.preferences',
      defaultMessage: 'Preferences',
    },
  }),
  preferences: defineMessages({
    libraryPath: {
      id: 'preferences.libraryPath',
      defaultMessage: 'Music library path',
    },
    updateLibrary: {
      id: 'preferences.updateLibrary',
      defaultMessage: 'Update library',
    },
    clearLibrary: {
      id: 'preferences.clearLibrary',
      defaultMessage: 'Clear library',
    },
  }),
};
