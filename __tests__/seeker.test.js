import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { Seeker } from '.';

let cmp;

const onSeek = jest.fn();

const props = {
  duration: 90,
  position: 30,
  onSeek,
};

test('component', () => {
  cmp = mount((
    <Provider store={store}>
      <Seeker {...props} />
    </Provider>
  ));
});

test('component', () => {
  cmp.find('.seeker').simulate('click');
  expect(onSeek.mock.calls.length).toBe(1);
});
