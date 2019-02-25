import _ from 'lodash';
import backend from './backend';

/**
 * @typedef {import('common/types').DbAlbum} DbAlbum
 * @typedef {import('common/types').DbTrack} DbTrack
 * @typedef {import('common/types').DbImage} DbImage
 * @typedef {import('common/types').Album} Album
 */

/**
 * @param {object} options
 * @param {DbAlbum[]} options.albums
 * @param {DbTrack[]} options.tracks
 * @param {DbImage[]} options.images
 */
const formAlbumList = ({ albums, tracks, images }) => {
  const fetchImage = (_id) => {
    const image = _.find(images, { _id });

    return {
      ...image,
      path: `file://${backend.configuration.imageDirectory}/${image.hash}`,
    };
  };

  /** @type {Album[]} */
  const result = [];

  _.each(albums, (album) => {
    let retAlbum = _.find(result, {
      title: album.title,
      releaseDate: album.releaseDate,
    });

    if (!retAlbum) {
      retAlbum = {
        _id: [album.title, album.releaseDate].join('/'),
        title: album.title,
        originalDate: album.originalDate,
        releaseDate: album.releaseDate,
        releaseType: album.releaseType,
        variant: album.variant,
        duration: 0,
        discs: [],
      };

      result.push(retAlbum);
    }

    let retDisc = _.find(retAlbum.discs, { number: album.discNumber });

    if (!retDisc) {
      retDisc = {
        _id: album._id,
        number: album.discNumber,
        title: album.discTitle,
        images: album.images,
        duration: 0,
        tracks: [],
      };

      retAlbum.discs.push(retDisc);
    }
  });

  _(result)
    .sortBy('releaseDate')
    .each((album) => {
      _(album.discs)
        .sortBy('number')
        .each((disc) => {
          disc.images = _.map(disc.images, _id => fetchImage(_id));
          disc.tracks = _(tracks)
            .filter({ album: disc._id })
            .sortBy('number')
            .map((/** @type {DbTrack} */ track) => {
              album.duration += track.duration;
              disc.duration += track.duration;

              return {
                ...track,
                images: _.map(track.images, _id => fetchImage(_id)),
                album,
              };
            })
            .value();
        });
    });

  return result;
};

export default formAlbumList;
