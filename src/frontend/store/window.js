import { ipcRenderer } from 'electron';
import { createAction } from 'redux-act';
import { takeLatest } from 'redux-saga/effects';

export const minimizeWindow = createAction('window/minimize');
export const maximizeWindow = createAction('window/maximize');
export const closeWindow = createAction('window/close');

export function* windowSaga() {
  yield takeLatest(minimizeWindow, () => {
    ipcRenderer.send('window/minimize');
  });

  yield takeLatest(maximizeWindow, () => {
    ipcRenderer.send('window/maximize');
  });

  yield takeLatest(closeWindow, () => {
    ipcRenderer.send('window/close');
  });
}
