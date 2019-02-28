import _ from 'lodash';

/**
 * @typedef {import('common/types').DbAlbum} DbAlbum
 * @typedef {import('common/types').DbTrack} DbTrack
 * @typedef {import('common/types').DbImage} DbImage
 * @typedef {import('common/types').Album} Album
 * @typedef {import('common/types').Image} Image
 * @typedef {import('common/types').Track} Track
 */

/**
 * @param {object} options
 * @param {DbAlbum[]} options.albums
 * @param {DbTrack[]} options.tracks
 * @param {DbImage[]} options.images
 */
const formAlbumList = ({ albums, tracks, images }) => {
  /**
   * @param {string} _id
   * @returns {Image}
   */
  const fetchImage = (_id) => {
    const image = _.find(images, { _id });

    if (!image) {
      throw new Error();
    }

    return {
      ...image,
      path: `file://${image.path}`,
    };
  };

  /**
   * @param {Album} album
   * @param {string} discId
   * @returns {Track[]}
   */
  const fetchTracks = (album, discId) => (
    _(tracks)
      .filter({ album: discId })
      .sortBy('number')
      .map(track => ({
        ...track,
        images: _.map(track.images, _id => fetchImage(_id)),
        album,
      }))
      .value()
  );

  /** @type {Album[]} */
  const retAlbums = [];

  albums = _.orderBy(albums, ['releaseDate', 'number']);

  _.each(albums, (album) => {
    let retAlbum = _.find(retAlbums, {
      title: album.title,
      releaseDate: album.releaseDate,
    });

    if (!retAlbum) {
      retAlbum = {
        _id: [album.title, album.releaseDate].join('/'),
        title: album.title,
        artist: album.artist,
        originalDate: album.originalDate,
        releaseDate: album.releaseDate,
        releaseType: album.releaseType,
        edition: album.edition,
        duration: 0,
        discs: [],
      };

      retAlbums.push(retAlbum);
    }

    let disc = _.find(retAlbum.discs, { number: album.discNumber });

    if (!disc) {
      const tracks = fetchTracks(retAlbum, album._id);

      disc = {
        _id: album._id,
        number: album.discNumber,
        title: album.discTitle,
        images: _.map(album.images, _id => fetchImage(_id)),
        duration: _.sumBy(tracks, 'duration'),
        tracks,
      };

      retAlbum.discs.push(disc);
    }
  });

  return retAlbums;
};

export default formAlbumList;
