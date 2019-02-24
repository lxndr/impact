import React from 'react';
import Artist from './artist';
import style from '../../style';

/**
 * @param {object} props
 * @param {string[]} props.artists
 */
const ArtistList = ({ artists }) => (
  <div className={style('artist-list')}>
    <ul>
      {artists.map(artist => (
        <Artist
          key={artist}
          name={artist}
        />
      ))}
    </ul>
  </div>
);

export default ArtistList;
