import R from 'ramda';
import defaultAlbumCover from '../assets/album.svg';

export const forTrack = (
  R.pipe(
    R.prop('images'),
    R.defaultTo([]),
    R.map(R.prop('path')),
    R.head,
    R.defaultTo(defaultAlbumCover),
  )
);

export const forDisc = (
  R.pipe(
    R.prop('album'),
    R.prop('discs'),
    R.defaultTo([]),
    // R.map(R.prop('images')),
    // R.unnest,
    // R.map(R.prop('path')),
    // R.head,
    // R.defaultTo(defaultAlbumCover),
    R.map(R.prop('tracks')),
    R.unnest,
    R.map(R.prop('images')),
    R.unnest,
    R.map(R.prop('path')),
    R.head,
    R.defaultTo(defaultAlbumCover),
  )
);
