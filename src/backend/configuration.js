import fs from 'fs-extra';

export default class Configuration {
  /** @type {string} */
  dbDirectory = ''

  /** @type {string} */
  imageDirectory = ''

  /** @type {string[]} */
  libararyPath = []

  /**
   * @param {string} configFile
   * @param {object} [defaultConfig]
   */
  constructor(configFile, defaultConfig = {}) {
    this.configFile = configFile;
    this.set(defaultConfig);
  }

  /**
   * @param {object} config
   */
  set(config) {
    Object.keys(this).forEach((key) => {
      if (key in config) {
        this[key] = config[key];
      }
    });
  }

  async load() {
    const config = await fs.readJSON(this.configFile);
    this.set(config);
  }
}
