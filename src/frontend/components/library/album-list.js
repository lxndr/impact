import React from 'react';
import PropTypes from 'prop-types';
import { albumShape, trackShape } from '../../utils';
import { Album } from './album';

let AlbumList = ({ albums, playingTrack, playTrack }) => (
  <div className="album-list">
    {albums.map(album => (
      <Album
        key={album.id}
        album={album}
        playingTrack={playingTrack}
        onSelect={playTrack}
      />
    ))}
  </div>
);

AlbumList.propTypes = {
  albums: PropTypes.arrayOf(albumShape).isRequired,
  playingTrack: trackShape,
  playTrack: PropTypes.func.isRequired,
};

AlbumList.defaultProps = {
  playingTrack: null,
};

AlbumList = connect(
  state => ({
    albums: state.library.albums,
    playingTrack: state.playback.track,
  }),
  {
    playTrack,
  },
)(AlbumList);

export { AlbumList };
