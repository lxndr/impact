import Configuration from './configuration';
import Database from './database';
import Library from './library';
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

    this.library = new Library({
      configuration: this.configuration,
      database: this.database,
    });

    this.scanner = new Scanner({
      configuration: this.configuration,
      library: this.library,
    });

    this.playback = new Playback({
      library: this.library,
      player,
    });
  }

  async startup() {
    try {
      await this.configuration.load();
    } catch (error) {
      console.error(error);
    }

    await this.database.init();
    await this.library.init();

    const libraryIsEmpty = await this.library.isEmpty();

    if (libraryIsEmpty) {
      await this.scanner.update();
    }
  }

  async shutdown() {
    this.playback.close();
  }

  createPlaylist() {
    return new Playlist({ library: this.library });
  }
}
