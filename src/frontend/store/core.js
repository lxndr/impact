import { createAction } from 'redux-act';

import {
  call,
  put,
  select,
  takeLatest,
} from 'redux-saga/effects';

import {
  refreshLibraryArtists,
  setCurrentTrack,
} from '.';

import { createObservableChannel } from '../utils';

export const initApplication = createAction('application/init');

function* initApplicationSaga() {
  const { backend } = yield select();
  yield call([backend, 'startup']);
/*
  const trackChannel = createObservableChannel(backend.playback.track$);
  yield takeLatest(trackChannel, function* trackSaga(track) {
    yield put(setCurrentTrack(track));
  });
*/
  yield put(refreshLibraryArtists());
}

export function* coreSaga() {
  yield takeLatest(initApplication, initApplicationSaga);
}
