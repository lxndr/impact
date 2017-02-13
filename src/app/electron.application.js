import {app, ipcMain, BrowserWindow} from 'electron';
import {Application} from './application';

export class ElectronApplication extends Application {
  win = null;

  get userDirectory() {
    return app.getPath('userData');
  }

  async init() {
    await Application.prototype.init.call(this); /* FIXME: use super */

    app.on('before-quit', event => {
      if (!this.closed) {
        event.preventDefault();
        this.deinit();
      }
    });

    app.on('window-all-closed', () => {
      app.quit();
    });

    ipcMain.on('playback/play', () => {
      this.playback.play();
    });

    ipcMain.on('playback/pause', () => {
      this.playback.pause();
    });

    this.createWindow();
  }

  async deinit() {
    await Application.prototype.deinit.call(this); /* FIXME: use super */
    app.quit();
  }

  createWindow() {
    this.win = new BrowserWindow({
      width: 1600,
      height: 700,
      frame: false,
      webPreferences: {
        webgl: false,
        webaudio: false,
        disableBlinkFeatures: [
          'Database',
          'IndexedDBExperimental'
        ].join(',')
      }
    });

    this.win.loadURL(`file://${__dirname}/../ui/index.html`);
    this.win.setMenu(null);
    this.win.openDevTools();

    this.win.on('closed', () => {
      this.win = null;
    });
  }
}
