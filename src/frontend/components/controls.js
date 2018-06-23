import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { trackShape, stateShape } from '../utils';
import { Seeker } from './seeker';

import {
  seekPlayback,
  playPrevTrack,
  togglePlayback,
  playNextTrack,
  minimizeWindow,
  maximizeWindow,
  closeWindow,
} from '../store';

let Controls = ({
  track,
  state,
  seekPlayback,
  playPrevTrack,
  togglePlayback,
  playNextTrack,
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  showPreferences,
}) => {
  let title = null;
  let album = null;
  let playing = false;
  let duration = 0;
  let position = 0;

  if (track) {
    const _artist = track.album.artist || 'Unknown artist';
    const _album = track.album.title || 'Unknown album';
    title = track.title || 'Unknown title';
    album = `by ${_artist} from ${_album}`;
    duration = track.duration;
  }

  if (state) {
    playing = state.state === 'playing';
    position = state.position;
  }

  return (
    <div className="media-controls">
      <div className="prev" onClick={playPrevTrack}><FontAwesomeIcon icon="backward" /></div>
      <div className="play" onClick={togglePlayback}><FontAwesomeIcon icon={playing ? 'pause' : 'play'} /></div>
      <div className="next" onClick={playNextTrack}><FontAwesomeIcon icon="forward" /></div>
      <div className="wmin" onClick={minimizeWindow}><FontAwesomeIcon icon="window-minimize" /></div>
      <div className="wmax" onClick={maximizeWindow}><FontAwesomeIcon icon="window-maximize" /></div>
      <div className="wcls" onClick={closeWindow}><FontAwesomeIcon icon="window-close" /></div>
      <div className="pref" onClick={showPreferences}><FontAwesomeIcon icon="cog" /></div>
      <img className="cover" src="images/album.svg" />
      <div className="title">{title}</div>
      <div className="album">{album}</div>
      <Seeker duration={duration} position={position} onSeek={seekPlayback} />
    </div>
  );
};

Controls.propTypes = {
  track: trackShape,
  state: stateShape,
  seekPlayback: PropTypes.func.isRequired,
  playPrevTrack: PropTypes.func.isRequired,
  togglePlayback: PropTypes.func.isRequired,
  playNextTrack: PropTypes.func.isRequired,
  minimizeWindow: PropTypes.func.isRequired,
  maximizeWindow: PropTypes.func.isRequired,
  closeWindow: PropTypes.func.isRequired,
  showPreferences: PropTypes.func.isRequired,
};

Controls.defaultProps = {
  track: null,
  state: null,
};

Controls = compose(
  withRouter,
  connect(
    state => ({
      track: state.playback.track,
      state: state.playback.state,
    }),
    (dispatch, { history }) => ({
      ...bindActionCreators({
        seekPlayback,
        playPrevTrack,
        togglePlayback,
        playNextTrack,
        minimizeWindow,
        maximizeWindow,
        closeWindow,
      }, dispatch),
      showPreferences() {
        history.push('/preferences');
      },
    }),
  ),
)(Controls);

export { Controls };
