import _ from 'lodash';

/**
 * @typedef {import('common/types').Album} Album
 */

/**
 * @param {Album[]} albums
 */
const getTracksFromAlbums = albums => _.flatMap(albums,
  album => _.flatMap(album.discs, disc => disc.tracks));

export default getTracksFromAlbums;
