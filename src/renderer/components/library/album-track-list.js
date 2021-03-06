import React from 'react';
import AlbumTrack from './album-track';

/**
 * @typedef {import('common/types').Track} Track
 */

/**
 * @param {object} props
 * @param {Track[]} props.tracks
 * @param {?Track} props.playingTrack
 * @param {(track: Track) => void} props.onSelect
 */
const AlbumTrackList = ({ tracks, playingTrack, onSelect }) => (
  <ul className="track-list">
    {tracks.map((track) => {
      const selected = Boolean(playingTrack && playingTrack._id === track._id);

      return (
        <AlbumTrack
          key={track._id}
          track={track}
          selected={selected}
          onClick={() => onSelect(track)}
        />
      );
    })}
  </ul>
);

export default React.memo(AlbumTrackList);
