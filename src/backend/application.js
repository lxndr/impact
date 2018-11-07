import Configuration from './configuration';
import Database from './database';
import Collection from './collection';
import Scanner from './scanner';
import Playback from './playback';
import Playlist from './playlist';

export default class Application {
  constructor() {
    this.configuration = new Configuration();
    this.database = new Database({ dbDirectory: this.configuration.dbDirectory });
    this.collection = new Collection({ database: this.database });
    this.scanner = new Scanner({ configuration: this.configuration, collection: this.collection });
    this.playback = new Playback({ collection: this.collection });
  }

  async startup() {
    await this.configuration.load();
    await this.database.init();

    const collectionIsEmpty = await this.collection.isEmpty();

    if (collectionIsEmpty) {
      await this.scanner.update();
    }
  }

  async shutdown() {
    this.playback.close();
  }

  createPlaylist() {
    return new Playlist({ collection: this.collection });
  }
}
