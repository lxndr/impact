import React from 'react';
import PropTypes from 'prop-types';
import fontawesome from '@fortawesome/fontawesome';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/fontawesome-free-solid';
import cn from 'classnames';
import { formatDuration, trackShape } from '../utils';

fontawesome.library.add(faPlay);

const AlbumTrack = ({ track, playing, onClick }) => (
  <li
    className={cn({ playing })}
    onClick={() => onClick(track)}
  >
    <FontAwesomeIcon className="play-icon" icon="play" />
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

export { AlbumTrack };
