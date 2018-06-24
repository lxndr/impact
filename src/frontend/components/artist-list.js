import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cn from 'classnames';
import { changeLibraryArtist } from '../store';
import { artistShape } from '../utils';

const Artist = ({ name, selected, onClick }) => (
  <li className={cn({ selected, unknown: !name })}>
    <a href="#" onClick={onClick}>{name || 'Unknown artist'}</a>
  </li>
);

Artist.propTypes = {
  name: PropTypes.string,
  selected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

Artist.defaultProps = {
  name: null,
  selected: false,
};

let ArtistList = ({ artists, selected, changeLibraryArtist }) => (
  <div className="artist-list">
    <ul>
      {artists.map(artist => (
        <Artist
          key={artist}
          name={artist}
          selected={artist === selected}
          onClick={() => changeLibraryArtist(artist)}
        />
      ))}
    </ul>
  </div>
);

ArtistList.propTypes = {
  artists: PropTypes.arrayOf(artistShape).isRequired,
  selected: PropTypes.string.isRequired,
  changeLibraryArtist: PropTypes.func.isRequired,
};

ArtistList = connect(
  state => ({
    artists: state.library.artists,
    selected: state.library.artist,
  }),
  {
    changeLibraryArtist,
  },
)(ArtistList);

export { ArtistList };
