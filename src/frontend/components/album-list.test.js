import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { AlbumList } from '.';

test('creation', () => {
  mount((
    <Provider store={store}>
      <AlbumList />
    </Provider>
  ));
});
