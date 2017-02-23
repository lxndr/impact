import path from 'path';
import {app, dialog, globalShortcut, ipcMain, BrowserWindow} from 'electron';
import {Database} from '@lxndr/orm';
import * as collection from './collection';
import * as playback from './playback';

export let db = null;
let win = null;
let closed = false;

async function deinit() {
  closed = true;
  await db.close();
  app.quit();
}

app.on('ready', () => {
  const userDirectory = app.getPath('userData');
  const dbPath = path.join(userDirectory, 'databases');

  db = new Database({
    driver: 'nedb',
    collections: [{
      name: 'tracks',
      path: path.join(dbPath, 'tracks.db'),
      indexes: [{
        field: 'path',
        unique: true
      }]
    }]
  });

  collection.start();

  /* window */
  win = new BrowserWindow({
    width: 1600,
    height: 700,
    frame: false
  });

  win.loadURL(`file://${__dirname}/../ui/index.html`);
  win.setMenu(null);
  win.openDevTools();

  app.on('before-quit', event => {
    if (!closed) {
      event.preventDefault();
      deinit().catch(err => {
        dialog.showErrorBox('Error while starting', err.message);
        console.error(err.stack);
      });
    }
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  /* global shortcuts */
  globalShortcut.register('MediaPreviousTrack', playback.previous);
  globalShortcut.register('MediaPlayPause', playback.toggle);
  globalShortcut.register('MediaNextTrack', playback.next);

  /*  */
  ipcMain.on('playback/toggle', playback.toggle);
  ipcMain.on('playback/next', playback.next);
  ipcMain.on('playback/previous', playback.previous);
});
