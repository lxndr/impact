import React from 'react';
import style from '../../style';
import Album from './album';

/**
 * @typedef {import('common/types').Album} AlbumType
 * @typedef {import('common/types').Track} Track
 */

/**
 * @param {object} props
 * @param {AlbumType[]} [props.albums]
 * @param {?Track} props.playingTrack
 * @param {(track: Track) => void} props.onPlay
 */
const AlbumList = ({ albums, playingTrack, onPlay }) => (
  <div className={style('album-list')}>
    {albums.map(album => (
      <Album
        key={album._id}
        album={album}
        playingTrack={playingTrack}
        onSelect={onPlay}
      />
    ))}
  </div>
);

export default React.memo(AlbumList);
