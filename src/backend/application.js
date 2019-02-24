import Configuration from './configuration';
import Database from './database';
import Collection from './collection';
import Scanner from './scanner';
import Playback from './playback';
import Playlist from './playlist';

/**
 * @typedef {import('common/types').Player} Player
 */

export default class Application {
  /**
   * @param {object} options
   * @param {string} options.configFile
   * @param {object} options.defaultConfig
   * @param {Player} options.player
   */
  constructor({ configFile, defaultConfig, player }) {
    this.configuration = new Configuration(configFile, defaultConfig);

    this.database = new Database({
      configuration: this.configuration,
    });

    this.collection = new Collection({
      configuration: this.configuration,
      database: this.database,
    });

    this.scanner = new Scanner({
      configuration: this.configuration,
      collection: this.collection,
    });

    this.playback = new Playback({
      collection: this.collection,
      player,
    });
  }

  async startup() {
    await this.configuration.load();
    await this.database.init();
    await this.collection.init();

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
