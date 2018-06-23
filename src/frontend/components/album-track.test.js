import React from 'react';
import { AlbumTrack } from '.';

let cmp;
const onClick = jest.fn();

test('with title', () => {
  const track = {
    id: 1,
    number: 1,
    title: 'Title',
    duration: 1000,
  };

  cmp = mount((
    <AlbumTrack
      track={track}
      playing
      onClick={onClick}
    />
  ));
});

test('without title', () => {
  const track = {
    id: 1,
    number: 1,
    duration: 1000,
  };

  cmp = mount((
    <AlbumTrack
      track={track}
      playing
      onClick={onClick}
    />
  ));
});

test('click', () => {
  cmp.simulate('click');
  expect(onClick.mock.calls.length).toBe(1);
});
