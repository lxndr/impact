import {inject} from '@lxndr/di';
import {Configuration} from './configuration';
import {Database} from './database';
import {Collection} from './collection';
import {Scanner} from './scanner';
import {Playback} from './playback';
import {Playlist} from './playlist';

export class Application {
  @inject(Configuration) configuration

  @inject(Database) database

  @inject(Collection) collection

  @inject(Scanner) scanner

  @inject(Playback) playback

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
