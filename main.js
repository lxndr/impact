const {app, BrowserWindow} = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false
  });

  win.setMenu(null);
  win.loadURL(`file://${__dirname}/index.html`);
  win.webContents.openDevTools();
  return win;
}

app.on('ready', () => {
  // BrowserWindow.addDevToolsExtension('/home/lxndr/.config/chromium/Default/Extensions/elgalmkoelokbchhkhacckoklkejnhcd/1.0.4_0');
  createWindow();
});
