import React from 'react';
import { AlbumDisc, AlbumTrack } from '.';

let cmp;
const onSelect = jest.fn();

const props = {
  disc: {
    number: 1,
    title: 'Title',
    images: [{
      id: 3,
      path: 'some/path',
    }],
    tracks: [{
      id: 1,
      title: 'Title',
    }],
  },
  showTitle: true,
  playingTrack: {
    id: 1,
    title: 'Title',
  },
  onSelect,
};

test('with title', () => {
  cmp = mount(<AlbumDisc {...props} />);
});

test('without title', () => {
  delete props.disc.title;
  cmp = mount(<AlbumDisc {...props} />);
});

test('select', () => {
  cmp.find(AlbumTrack).simulate('click');
  expect(onSelect.mock.calls.length).toBe(1);
});
