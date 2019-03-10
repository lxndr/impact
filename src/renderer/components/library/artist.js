import React from 'react';
import { NavLink } from 'react-router-dom';
import cn from 'classnames';

/** @param {?string} artist */
const createArtistUrl = (artist) => {
  const name = artist ? encodeURIComponent(artist) : '';
  return `/library/by-artist/${name}`;
};

/**
 * @param {object} props
 * @param {?string} props.name
 */
const Artist = ({ name }) => (
  <li className={cn({ unknown: !name })}>
    <NavLink to={createArtistUrl(name)}>{name || 'Unknown artist'}</NavLink>
  </li>
);

export default Artist;
