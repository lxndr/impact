import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { trackShape } from '../../utils';
import AlbumTrack from './album-track';

const AlbumTrackList = ({ tracks, playingTrack, onSelect }) => (
  <ul className="track-list">
    {tracks.map((track) => {
      const playing = playingTrack && playingTrack._id === track._id;
      return <AlbumTrack key={track._id} track={track} playing={playing} onClick={onSelect} />;
    })}
  </ul>
);

AlbumTrackList.propTypes = {
  tracks: PropTypes.arrayOf(trackShape),
  playingTrack: trackShape,
  onSelect: PropTypes.func,
};

AlbumTrackList.defaultProps = {
  tracks: [],
  playingTrack: null,
  onSelect: _.noop,
};

export default AlbumTrackList;
