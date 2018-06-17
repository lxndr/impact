import React from 'react';
import { Album } from '.';

test('creation', () => {
  const props = {
    album: {
      id: 1,
      discs: [{
        id: 1,
        title: 'Disc title',
      }],
    },
    playingTrack: {
      id: 1,
    },
    onSelect: jest.fn(),
  };

  render(<Album {...props} />);
});
