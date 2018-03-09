import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {Track} from './album-track';

export class TrackList extends React.PureComponent {
  static propTypes = {
    tracks: PropTypes.array,
    playingTrack: PropTypes.object,
    onSelect: PropTypes.func
  }

  static defaultProps = {
    tracks: [],
    playingTrack: null,
    onSelect: _.noop
  }

  render() {
    const {tracks, playingTrack, onSelect} = this.props;

    return (
      <ul className="track-list">
        {tracks.map(track => {
          const playing = playingTrack && playingTrack._id === track._id;
          return <Track key={track._id} track={track} playing={playing} onClick={onSelect}/>;
        })}
      </ul>
    );
  }
}
