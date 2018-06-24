import React from 'react';
import { Provider } from 'react-redux';
import { store, setLibraryArtists } from '../store';
import { ArtistList } from '.';

let cmp;

test('component', () => {
  store.dispatch(setLibraryArtists([
    'Artist 1',
    'Artist 2',
    '',
  ]));

  cmp = mount((
    <Provider store={store}>
      <ArtistList />
    </Provider>
  ));
});

test('component', () => {
  cmp.find('Artist a').at(0).simulate('click');
  expect(store.getState().library.currentArtist).toBe('Artist 1');
});
