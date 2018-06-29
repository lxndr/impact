import { ipcRenderer } from 'electron';

export class WindowStore {
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
