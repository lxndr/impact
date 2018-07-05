import { ipcRenderer } from 'electron';
import { observable } from 'mobx';
import { backend } from './backend';
import { library } from './library';
import { playback } from './playback';

export const store = observable({
  config: {
    language: 'en',
  },

  library,
  playback,

  init: async () => {
    await backend.startup();
    await library.refreshArtists();
  },

  minimize: () => {
    ipcRenderer.send('window/minimize');
  },

  maximize: () => {
    ipcRenderer.send('window/maximize');
  },

  close: () => {
    ipcRenderer.send('window/close');
  },
});
