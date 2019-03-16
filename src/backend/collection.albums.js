import R from 'ramda';

/**
 * @typedef {import('common/types').DbAlbum} DbAlbum
 * @typedef {import('common/types').DbTrack} DbTrack
 * @typedef {import('common/types').DbImage} DbImage
 * @typedef {import('common/types').DbFile} DbFile
 * @typedef {import('common/types').Album} Album
 * @typedef {import('common/types').Disc} Disc
 * @typedef {import('common/types').Image} Image
 * @typedef {import('common/types').Track} Track
 * @typedef {import('common/types').Id} Id
 */

/** @param {(Disc | Track)[]} items */
const calcDuration = items => items.reduce((acc, item) => acc + item.duration, 0);

/**
 * @param {object} options
 * @param {DbAlbum[]} options.dbalbums
 * @param {DbTrack[]} options.dbtracks
 * @param {DbImage[]} options.dbimages
 * @param {DbFile[]} options.dbfiles
 * @returns {Album[]}
 */
const formAlbumList = ({
  dbalbums,
  dbtracks,
  dbimages,
  dbfiles,
}) => {
  dbalbums = R.sortWith([
    R.ascend(R.prop('originalDate')),
    R.ascend(R.prop('releaseDate')),
    R.ascend(R.prop('discNumber')),
  ], dbalbums);

  /**
   * @param {string} _id
   * @returns {Image}
   */
  const fetchImage = (_id) => {
    const image = R.find(R.propEq('_id', _id), dbimages);

    if (!image) {
      throw new Error();
    }

    return {
      ...image,
      path: `file://${image.path}`,
    };
  };

  const fetchImages = R.map(fetchImage);

  /** @param {Id?} _id */
  const fetchFile = _id => R.find(dbfile => dbfile._id === _id, dbfiles);

  /**
   * @param {DbAlbum} dbalbum
   * @param {Album} album
   * @returns {Track[]}
   */
  const fetchTracks = (dbalbum, album) => (
    R.pipe(
      R.filter(R.propEq('album', dbalbum._id)),
      R.sortBy(R.prop('number')),
      R.map(({ file, index, ...track }) => ({
        ...track,
        images: fetchImages([...track.images, ...dbalbum.images]),
        file: fetchFile(file),
        index: fetchFile(index),
        album,
      })),
    )(dbtracks)
  );

  /** @type {Album[]} */
  const albums = [];

  dbalbums.forEach((dbalbum) => {
    const {
      _id,
      discNumber,
      discTitle,
      images,
      ...baseAlbum
    } = dbalbum;

    /** @type {Album | undefined} */
    let album = R.find(R.whereEq(baseAlbum), albums);

    if (!album) {
      const albumId = Object.values(baseAlbum).join(' | ');

      album = {
        _id: albumId,
        ...baseAlbum,
        duration: 0,
        discs: [],
      };

      albums.push(album);
    }

    /** @type {Disc | undefined} */
    let disc = R.find(R.propEq('number', discNumber), album.discs);

    if (!disc) {
      const tracks = fetchTracks(dbalbum, album);
      const duration = calcDuration(tracks);

      const trackImages = tracks.flatMap(R.prop('images'));
      const discImages = fetchImages(images).concat(trackImages);

      disc = {
        _id,
        number: discNumber,
        title: discTitle,
        images: R.uniqBy(R.prop('_id'), discImages),
        duration,
        tracks,
      };

      album.discs.push(disc);
    }
  });

  return albums;
};

export default formAlbumList;
