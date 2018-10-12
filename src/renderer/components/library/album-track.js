import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { formatDuration, trackShape } from '../../utils';

const AlbumTrack = ({ track, playing, onClick }) => (
  <li
    className={cn({ playing })}
    onClick={() => onClick(track)}
  >
    <FontAwesomeIcon className="play-icon" icon={faPlay} />
    <div className="number">{track.number}</div>
    <div className="title">{track.title || 'Unknown title'}</div>
    <div className="duration">{formatDuration(track.duration)}</div>
  </li>
);

AlbumTrack.propTypes = {
  track: trackShape.isRequired,
  playing: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default AlbumTrack;