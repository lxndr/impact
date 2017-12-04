import {app, dialog, ipcMain, globalShortcut, BrowserWindow} from 'electron';
import * as db from './database';
import * as collection from './collection';
import * as playback from './playback';

let win = null;
let closed = false;

async function init() {
  await db.init();

  collection.start();

  return;

  /* window */
  win = new BrowserWindow({
    width: 1600,
    height: 700,
    frame: false,
    webPreferences: {
      webgl: false,
      webaudio: false
    }
  });

  win.loadURL(`file://${__dirname}/../../src/ui/index.html`);
  win.setMenu(null);
  win.openDevTools();

  app.on('before-quit', event => {
    if (!closed) {
      event.preventDefault();
      deinit().catch(err => {
        dialog.showErrorBox('Error while shutting down:', err.message);
        console.error(err.stack);
      });
    }
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  /* shortcuts */
  globalShortcut.register('MediaPreviousTrack', playback.previous);
  globalShortcut.register('MediaPlayPause', playback.toggle);
  globalShortcut.register('MediaNextTrack', playback.next);

  /* ipc */
  ipcMain.on('window/minimize', event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.minimize();
  });

  ipcMain.on('window/maximize', event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('window/close', event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.close();
  });
}

async function deinit() {
  closed = true;
  await db.deinit();
  app.quit();
}

app.on('ready', () => {
  init().catch(err => {
    app.quit();
    dialog.showErrorBox('Error while starting up:', err.message);
    console.error(err);
  });
});
