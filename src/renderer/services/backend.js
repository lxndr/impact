/* eslint-disable-next-line import/no-extraneous-dependencies */
import { remote } from 'electron';
import path from 'path';
import Application from '../../backend';
import Player from '../../backend/player.mpv';

const { app } = remote.require('electron');
const { mpv } = remote.require('./main');
const musicDiorectory = app.getPath('music');
const configDirectory = app.getPath('userData');
const configFile = path.join(configDirectory, 'config.json');
const player = new Player({ mpv });

const defaultConfig = {
  dbDirectory: path.join(configDirectory, 'databases'),
  imageDirectory: path.join(configDirectory, 'images'),
  libararyPath: [musicDiorectory],
};

export default new Application({ configFile, defaultConfig, player });
