import { Configuration } from './configuration';
import { Database } from './database';
import { Collection } from './collection';
import { Scanner } from './scanner';
import { Playback } from './playback';
import { Playlist } from './playlist';

export class Application {
  constructor() {
    this.configuration = new Configuration();
    this.database = new Database();
    this.collection = new Collection(this);
    this.scanner = new Scanner(this);
    this.playback = new Playback(this);
  }

  async startup() {
    await this.configuration.load();
    await this.database.open();
    this.scanner.update();
  }

  async shutdown() {
    this.playback.close();
  }

  createPlaylist() {
    return new Playlist(this.collection);
  }
}