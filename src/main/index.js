/* eslint-disable-next-line import/no-extraneous-dependencies */
import {
  app,
  ipcMain,
  globalShortcut,
  BrowserWindow,
} from 'electron';

import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import mpv from './mpv';

export { mpv }; // eslint-disable-line import/prefer-default-export

const isDevelopment = process.env.NODE_ENV !== 'production';

app.on('ready', () => {
  /* window */
  const win = new BrowserWindow({
    width: 1600,
    height: 700,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  win.loadURL(
    isDevelopment
      ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
      : `file://${__dirname}/index.html`,
  );

  win.setMenu(null);

  if (isDevelopment) {
    Promise.all([
      installExtension(REACT_DEVELOPER_TOOLS),
    ]).catch(/* console.error */);
    win.webContents.openDevTools();
  }

  app.on('window-all-closed', () => {
    mpv.close();
    app.quit();
  });

  /* shortcuts */
  globalShortcut.register('MediaPreviousTrack', () => {
    // console.log('MediaPreviousTrack');
  });

  globalShortcut.register('MediaPlayPause', () => {
    // console.log('MediaPlayPause');
  });

  globalShortcut.register('MediaNextTrack', () => {
    // console.log('MediaNextTrack');
  });

  /* ipc */
  ipcMain.on('window/minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender).minimize();
  });

  ipcMain.on('window/toggle', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);

    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('window/close', (event) => {
    BrowserWindow.fromWebContents(event.sender).close();
  });
});
