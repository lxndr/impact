import { createAction, createReducer } from 'redux-act';
import { call, select, takeLatest } from 'redux-saga/effects';

const initialState = {
  track: null,
  state: null,
};

export const setCurrentTrack = createAction('playback/setTrack');
export const setCurrentState = createAction('playback/setState');
export const playTrack = createAction('playback/play');
export const seekPlayback = createAction('playback/seek');
export const playNextTrack = createAction('playback/next');
export const playPrevTrack = createAction('playback/prev');
export const togglePlayback = createAction('playback/toggle');

export const playbackReducer = createReducer({
  [setCurrentTrack]: (state, track) => ({
    ...state,
    track,
  }),
  [setCurrentState]: (oldState, state) => ({
    ...oldState,
    state,
  }),
}, initialState);

function* playTrackSaga({ payload: track }) {
  const { backend, library } = yield select();
  const playlist = backend.createPlaylist();
  yield call([playlist, 'forArtist'], library.artist);
  backend.playback.playlist = playlist;
  backend.playback.play(track.id);
}

export function* playbackSaga() {
  yield takeLatest(playTrack, playTrackSaga);

  yield takeLatest(playNextTrack, () => {
  });
}
