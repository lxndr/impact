import { ipcRenderer } from 'electron';
import store from '.';

class WindowStore {
  minimize = () => {
    ipcRenderer.send('window/minimize');
  }

  maximize = () => {
    ipcRenderer.send('window/maximize');
  }

  close = () => {
    store.deinit().then(() => {
      ipcRenderer.send('window/close');
    });
  }
}

export default new WindowStore();
