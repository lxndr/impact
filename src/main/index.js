import path from 'path';
import {app, ipcMain, globalShortcut, BrowserWindow} from 'electron';

app.on('ready', () => {
  const userdir = app.getPath('home');

  /* window */
  const win = new BrowserWindow({
    width: 1600,
    height: 700,
    frame: false
  });

  win.loadURL(`file://${__dirname}/frontend.html`);
  win.setMenu(null);

  if (process.env.NODE_ENV === 'development') {
    const dir = path.join(userdir, '.config/chromium/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.2.1_0/');
    BrowserWindow.addDevToolsExtension(dir);
    win.openDevTools();
  }

  app.on('window-all-closed', () => {
    app.quit();
  });

  /* shortcuts */
  globalShortcut.register('MediaPreviousTrack', () => {
    console.log('MediaPreviousTrack');
  });

  globalShortcut.register('MediaPlayPause', () => {
    console.log('MediaPlayPause');
  });

  globalShortcut.register('MediaNextTrack', () => {
    console.log('MediaNextTrack');
  });

  /* ipc */
  ipcMain.on('window/minimize', event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.minimize();
  });

  ipcMain.on('window/toggle', event => {
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
});
