import path from 'path';
import {app, ipcMain, BrowserWindow} from 'electron';
import {inject} from '@lxndr/di';
import {Config} from '@lxndr/config';
import {Database} from '@lxndr/orm';
import {Collection} from './collection';
import {Playback} from './playback';
import * as store from './store';

export class Application {
  @inject(Config) config;
  @inject(Database) db;
  @inject(Collection) collection;
  @inject(Playback) playback;
  closed = false;
  win = null;

  async init() {
    this.setupDatabase();
    this.collection.start();

    store.collection.artists = () => {
      return this.collection.artists();
    };

    store.collection.allOfArtist = artist => {
      return this.collection.allOfArtist(artist);
    };

    store.playback.play = track => {
      this.playback.play(track);
    };

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

  setupDatabase() {
    const userDirectory = app.getPath('userData');
    const dbPath = path.join(userDirectory, 'databases');

    this.db = new Database({
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

  async deinit() {
    this.closed = true;
    await this.db.close();
    app.quit();
  }
}
