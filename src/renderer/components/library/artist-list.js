import React from 'react';
import { withRouter } from 'react-router';
import Artist from './artist';
import style from '../../style';

/**
 * @typedef {import('react-router').match} Match
 */

/**
 * @param {object} props
 * @param {string?[]} props.artists
 * @param {Match} props.match
 */
const ArtistList = ({
  artists,
  match: {
    params: { artist: activeArtist = null },
  },
}) => (
  <div className={style('artist-list')}>
    <ul>
      {artists.map(artist => (
        <Artist
          key={artist || ''}
          name={artist}
          active={activeArtist === artist}
        />
      ))}
    </ul>
  </div>
);

export default withRouter(ArtistList);
