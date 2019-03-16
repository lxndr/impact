import React from 'react';
import cn from 'classnames';
import { formatDuration } from '../../utils';

/**
 * @typedef {import('common/types').Track} Track
 */

/**
 * @param {object} props
 * @param {Track} props.track
 * @param {boolean} props.selected
 * @param {() => void} props.onClick
 */
const AlbumTrack = ({ track, selected, onClick }) => (
  <li className={cn({ selected })}>
    <button type="button" onClick={onClick}>
      <div className="number">{track.number}</div>
      <div className="title">{track.title || 'Unknown title'}</div>
      <div className="duration">{formatDuration(track.duration)}</div>
    </button>
  </li>
);

export default React.memo(AlbumTrack);
