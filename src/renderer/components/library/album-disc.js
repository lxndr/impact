import _ from 'lodash';
import React from 'react';
import AlbumTrackList from './album-track-list';

/**
 * @typedef {import('common/types').Disc} Disc
 * @typedef {import('common/types').Track} Track
 */

/** @param {Disc} disc */
const displayTitle = disc => (disc.title ? `Disc ${disc.number}: ${disc.title}` : `Disc ${disc.number}`);

/** @param {Disc} disc */
const getImages = (disc) => {
  const images = disc.images.concat(
    _.flatMap(disc.tracks, 'images'),
  );

  // return _.uniqBy(images, '_id');
  return images.length ? [images[0]] : [];
};

/**
 * @param {object} props
 * @param {Disc} props.disc
 * @param {boolean} props.showTitle
 * @param {?Track} props.playingTrack
 * @param {(track: Track) => void} props.onSelect
 */
const AlbumDisc = ({
  disc,
  showTitle,
  playingTrack,
  onSelect,
}) => (
  <div className="disc">
    {showTitle && (
      <div className="disc-title">
        {displayTitle(disc)}
      </div>
    )}

    <div className="cover-container">
      {getImages(disc).map(image => (
        <img alt="album cover" key={image._id} className="cover" src={image.path} />
      ))}
    </div>

    <AlbumTrackList tracks={disc.tracks} playingTrack={playingTrack} onSelect={onSelect} />
  </div>
);

export default React.memo(AlbumDisc);
