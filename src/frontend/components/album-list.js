import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { playTrack } from '../store';
import { albumShape, trackShape } from '../utils';
import { Album } from '.';

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

/*
export class ArtistTrackList extends React.Component {
  @autobind
  handleSelect(track) {
    const { backend } = this.props;

    Promise.resolve().then(async () => {
      const playlist = backend.createPlaylist();
      await playlist.forArtist(this.props.artist);
      backend.playback.playlist = playlist;
      backend.playback.play(track.id);
    }, console.error);
  }
}
*/
