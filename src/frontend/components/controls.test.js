import React from 'react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { store, setCurrentTrack, setCurrentState } from '../store';
import { Controls } from '.';

let cmp;

test('component', () => {
  cmp = mount((
    <Provider store={store}>
      <MemoryRouter>
        <Controls />
      </MemoryRouter>
    </Provider>
  ));
});

test('set track and state', () => {
  store.dispatch(setCurrentTrack({
    id: 1,
    title: 'Title',
    duration: 5000,
    album: {
      title: 'Album',
      artist: 'Artist',
    },
  }));

  store.dispatch(setCurrentState({
    state: 'playing',
    position: 15,
  }));
});

test('set track with empty tags', () => {
  store.dispatch(setCurrentTrack({
    id: 1,
    duration: 5000,
    album: {
    },
  }));
});

test('click buttons', () => {
  ['prev', 'play', 'next', 'wmin', 'wmax', 'wcls', 'pref'].forEach(cls => (
    cmp.find(`.${cls}`).simulate('click')
  ));
});
