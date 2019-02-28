import React from 'react';
import { formatDate } from '../../utils';
import AlbumDisc from './album-disc';

/**
 * @typedef {import('../../../common/types').Album} AlbumType
 * @typedef {import('../../../common/types').Track} Track
 */

/**
 * @param {object} props
 * @param {AlbumType} props.album
 * @param {?Track} props.playingTrack
 * @param {(track: Track) => void} props.onSelect
 */
const Album = ({ album, playingTrack, onSelect }) => (
  <div className="album">
    <div className="header">
      <div className="title">{album.title || 'Unknown album'}</div>

      {album.edition && (
        <div className="edition">{album.edition}</div>
      )}

      <div className="spacer" />

      {album.releaseDate && (
        <div className="release-date">{formatDate(album.releaseDate)}</div>
      )}
    </div>

    {album.discs.map((disc) => {
      const showTitle = Boolean(disc.title || album.discs.length > 1);

      return (
        <AlbumDisc
          key={disc._id}
          disc={disc}
          showTitle={showTitle}
          playingTrack={playingTrack}
          onSelect={onSelect}
        />
      );
    })}
  </div>
);

Album.defaultProps = {
  playingTrack: null,
};

export default Album;
