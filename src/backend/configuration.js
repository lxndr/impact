import { remote } from 'electron';

export default class Configuration {
  libararyPath = [
    remote.require('electron').app.getPath('music'),
  ]

  async load() {}
}
