import { createAction, createReducer } from 'redux-act';

const initialState = {
  artists: [],
  currentArtist: '',
  tracks: [],
};

export const changeArtistList = createAction('library/changeArtistList');
export const changeCurrentArtist = createAction('library/changeCurrentArtist');

export const libraryReducer = createReducer({
  [changeArtistList]: (state, artists) => ({
    ...state,
    artists,
  }),
  [changeCurrentArtist]: (state, artist) => ({
    ...state,
    currentArtist: artist,
  }),
}, initialState);
