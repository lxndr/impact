import React from 'react';
import PropTypes from 'prop-types';
import { trackShape, albumShape } from '../../utils';
import AlbumDisc from './album-disc';

const Album = ({ album, playingTrack, onSelect }) => (
  <div className="album">
    <div className="header">
      <div className="title">{album.title || 'Unknown album'}</div>

      {album.variant && (
        <div className="title">{album.variant}</div>
      )}

      <div className="spacer" />

      {album.releaseDate && (
        <div className="release-date">{album.releaseDate}</div>
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

Album.propTypes = {
  album: albumShape.isRequired,
  playingTrack: trackShape,
  onSelect: PropTypes.func.isRequired,
};

Album.defaultProps = {
  playingTrack: null,
};

export default Album;
