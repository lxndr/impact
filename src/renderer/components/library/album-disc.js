import React from 'react';
import AlbumTrackList from './album-track-list';

/**
 * @typedef {import('common/types').Disc} Disc
 * @typedef {import('common/types').Track} Track
 */

/** @param {Disc} disc */
const displayTitle = disc => (disc.title ? `Disc ${disc.number}: ${disc.title}` : `Disc ${disc.number}`);

/**
 * @param {object} props
 * @param {Disc} props.disc
 * @param {boolean} props.showTitle
 * @param {string} [props.image]
 * @param {?Track} props.playingTrack
 * @param {(track: Track) => void} props.onSelect
 */
const AlbumDisc = ({
  disc,
  showTitle,
  image,
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
      <img alt="album cover" className="cover" src={image} />
    </div>

    <AlbumTrackList tracks={disc.tracks} playingTrack={playingTrack} onSelect={onSelect} />
  </div>
);

export default React.memo(AlbumDisc);
