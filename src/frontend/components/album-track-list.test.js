import React from 'react';
import { AlbumTrackList } from '.';

test('creation', () => {
  const props = {
    track: {
      id: 1,
      title: 'Title',
      duration: 1000,
    },
    playing: true,
    onClick: jest.fn(),
  };

  mount(<AlbumTrackList {...props} />);
});
