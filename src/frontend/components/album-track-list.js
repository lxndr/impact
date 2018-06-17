import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { trackShape } from '../utils';
import { AlbumTrack } from '.';

const AlbumTrackList = ({ tracks, playingTrack, onSelect }) => (
  <ul className="track-list">
    {tracks.map((track) => {
      const playing = playingTrack && playingTrack.id === track.id;
      return <AlbumTrack key={track.id} track={track} playing={playing} onClick={onSelect} />;
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

export { AlbumTrackList };
