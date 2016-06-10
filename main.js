const {app, BrowserWindow} = require('electron');

let win;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false
  });

  win.setMenu(null);

  win.loadURL(`file://${__dirname}/index.html`);

  return win;
}

app.on('ready', () => {
  BrowserWindow.addDevToolsExtension('/home/lxndr/.config/chromium/Default/Extensions/elgalmkoelokbchhkhacckoklkejnhcd/1.0.1_0');

  win = createWindow();
  win.webContents.openDevTools();
});

