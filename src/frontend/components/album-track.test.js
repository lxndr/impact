import React from 'react';
import { AlbumTrack } from '.';

let cmp;
const onClick = jest.fn();

const props = {
  track: {
    id: 1,
    number: 1,
    title: 'Title',
    duration: 1000,
  },
  playing: true,
  onClick,
};

test('with title', () => {
  cmp = shallow(<AlbumTrack {...props} />);
});

test('without title', () => {
  delete props.track.title;
  cmp = shallow(<AlbumTrack {...props} />);
});

test('click', () => {
  cmp.simulate('click');
  expect(onClick.mock.calls.length).toBe(1);
});
