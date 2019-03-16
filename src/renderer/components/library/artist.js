import React from 'react';
import { Link, generatePath } from 'react-router-dom';
import cn from 'classnames';

/** @param {?string} artist */
const createArtistUrl = artist => (
  artist
    ? generatePath('/library/by-artist/:artist', { artist })
    : '/library/by-artist'
);

/**
 * @param {object} props
 * @param {?string} props.name
 * @param {boolean} props.active
 */
const Artist = ({ name, active }) => (
  <li className={cn({ active, unknown: !name })}>
    <Link to={createArtistUrl(name)} draggable={false}>
      {name || 'Unknown artist'}
    </Link>
  </li>
);

export default React.memo(Artist);
