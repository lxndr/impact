import path from 'path';
import {app, dialog, ipcMain, globalShortcut, BrowserWindow} from 'electron';
import {Application} from './application';
import {registerRemoteCallTarget} from './remote-call';

export const impact = new Application();

async function run() {
  impact.libararyPath = path.join(app.getPath('userData'), 'Music');
  await impact.startup();

  /* window */
  const win = new BrowserWindow({
    width: 1600,
    height: 700,
    frame: false,
    webPreferences: {
      webgl: false,
      webaudio: false
    }
  });

  win.loadURL(`file://${__dirname}/index.html`);
  win.setMenu(null);

  if (process.env.NODE_ENV === 'development') {
    BrowserWindow.addDevToolsExtension('/home/lxndr/.config/chromium/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.1.0_0/');
    win.openDevTools();
  }

  app.on('before-quit', () => {
    impact.shutdown().catch(err => {
      console.error(err.stack);
      dialog.showErrorBox('Error while shutting down:', err.message);
    });
  });

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

  registerRemoteCallTarget('app', impact);
}

app.on('ready', () => {
  run().catch(err => {
    console.error(err);
    dialog.showErrorBox('Error while starting up:', err.message);
    app.quit();
  });
});
