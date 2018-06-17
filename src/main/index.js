import { app, ipcMain, globalShortcut, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

app.on('ready', () => {
  /* window */
  const win = new BrowserWindow({
    width: 1600,
    height: 700,
    frame: false,
  });

  win.loadURL(`file://${__dirname}/frontend.html`);
  win.setMenu(null);

  if (process.env.NODE_ENV === 'development') {
    Promise.all([
      installExtension(REACT_DEVELOPER_TOOLS),
      installExtension(REDUX_DEVTOOLS),
    ]).catch(console.error);

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
  ipcMain.on('window/minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.minimize();
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
    const win = BrowserWindow.fromWebContents(event.sender);
    win.close();
  });
});
