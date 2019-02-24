/* eslint-disable-next-line import/no-extraneous-dependencies */
import { ipcRenderer } from 'electron';

export const minimize = () => {
  ipcRenderer.send('window/minimize');
};

export const toggle = () => {
  ipcRenderer.send('window/toggle');
};

export const close = () => {
  ipcRenderer.send('window/close');
};
