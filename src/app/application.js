import {ExtensionManager} from './extension-manager';
import {Database} from './database';
import {Collection} from './collection';
import {Scanner, flacHandler} from './scanner';
import {Playback} from './playback';
import {Playlist} from './playlist';

export class Application {
  constructor() {
    this.extensionManager = new ExtensionManager();
    this.database = new Database();
    this.collection = new Collection(this.database);
    this.scanner = new Scanner(this.collection);
    this.playback = new Playback(this.collection);

    this.scanner.registerType('flac', flacHandler);
  }

  async startup() {
    await this.extensionManager.init();
    await this.database.init();
    await this.scanner.run();
  }

  async shutdown() {
  }

  createPlaylist() {
    return new Playlist(this.collection);
  }
}
