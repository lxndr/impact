import React from 'react';
import Artist from './artist';
import style from '../../style';

/**
 * @param {object} props
 * @param {string?[]} props.artists
 * @param {string?} props.selectedArtist
 */
const ArtistList = ({
  artists,
  selectedArtist,
}) => (
  <div className={style('artist-list')}>
    <ul>
      {artists.map(artist => (
        <Artist
          key={artist || ''}
          name={artist}
          active={selectedArtist === artist}
        />
      ))}
    </ul>
  </div>
);

export default React.memo(ArtistList);
