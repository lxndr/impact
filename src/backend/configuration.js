import path from 'path';
import { remote } from 'electron';

const { app } = remote.require('electron');

export default class Configuration {
  dbDirectory = path.join(app.getPath('userData'), 'databases')

  libararyPath = [
    app.getPath('music'),
  ]

  async load() {}
}
