import React from 'react';
import cn from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { formatDuration } from '../../utils';

/**
 * @typedef {import('common/types').Track} Track
 */

/**
 * @param {object} props
 * @param {Track} props.track
 * @param {boolean} props.playing
 * @param {(track: Track) => void} props.onClick
 */
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

export default React.memo(AlbumTrack);
