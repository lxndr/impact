import { ipcRenderer } from 'electron';

class WindowStore {
  minimize = () => {
    ipcRenderer.send('window/minimize');
  }

  maximize = () => {
    ipcRenderer.send('window/maximize');
  }

  close = () => {
    ipcRenderer.send('window/close');
  }
}

export default new WindowStore();
