import _ from 'lodash';
import { createAction, createReducer } from 'redux-act';

import {
  call,
  put,
  select,
  takeLatest,
} from 'redux-saga/effects';

const initialState = {
  artists: [],
  artist: '',
  albums: [],
};

export const refreshLibraryArtists = createAction('library/refreshArtists');
export const setLibraryArtists = createAction('library/setArtists');
export const changeLibraryArtist = createAction('library/changeArtist');
export const setLibraryArtist = createAction('library/setArtist');
export const setLibraryAlbums = createAction('library/setAlbums');

export const libraryReducer = createReducer({
  [setLibraryArtists]: (state, artists) => ({
    ...state,
    artists,
  }),
  [setLibraryArtist]: (state, artist) => ({
    ...state,
    artist,
    albums: [],
  }),
  [setLibraryAlbums]: (state, albums) => ({
    ...state,
    albums,
  }),
}, initialState);

function* refreshArtistsSaga() {
  const { backend } = yield select();
  const artists = yield call([backend.collection, 'artists']);
  yield put(setLibraryArtists(artists));
}

function formAlbumList({ albums, tracks }) {
  const retAlbums = [];

  _.each(albums, (album) => {
    let retAlbum = _.find(retAlbums, {
      title: album.title,
      releaseDate: album.releaseDate,
    });

    if (!retAlbum) {
      retAlbum = {
        id: [album.title, album.releaseDate].join('/'),
        title: album.title,
        releaseDate: album.releaseDate,
        originalDate: album.originalDate,
        duration: 0,
        discs: [],
      };

      retAlbums.push(retAlbum);
    }

    let retDisc = _.find(retAlbum.discs, { number: album.discNumber });

    if (!retDisc) {
      retDisc = {
        id: album.id,
        number: album.discNumber,
        title: album.discTitle,
        duration: 0,
        tracks: [],
      };

      retAlbum.discs.push(retDisc);
    }
  });

  return _(retAlbums)
    .sortBy('releaseDate')
    .each((album) => {
      album.discs = _(album.discs)
        .sortBy('number')
        .each((disc) => {
          disc.tracks = _(tracks)
            .filter({ album: disc.id })
            .sortBy('number')
            .each((track) => {
              album.duration += track.duration;
              disc.duration += track.duration;
            });
        });
    });
}

function* changeArtistSaga({ payload: artist }) {
  const { backend } = yield select();
  const result = yield call([backend.collection, 'allOfArtist'], artist);
  const albums = formAlbumList(result);
  yield put(setLibraryAlbums(albums));
}

export function* librarySaga() {
  yield takeLatest(refreshLibraryArtists, refreshArtistsSaga);
  yield takeLatest(changeLibraryArtist, changeArtistSaga);
}
