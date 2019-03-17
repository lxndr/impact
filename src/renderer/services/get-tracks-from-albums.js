/**
 * @typedef {import('common/types').Album} Album
 */

/**
 * @param {Album[]} albums
 */
const getTracksFromAlbums = albums => albums.flatMap(
  album => album.discs.flatMap(disc => disc.tracks),
);

export default getTracksFromAlbums;
