import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { observer } from 'mobx-react';
import store from '../../store';
import style from '../../style';

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

@observer
export default class ArtistList extends React.Component {
  render() {
    const {
      library: {
        artists,
        artist: selected,
        changeArtist,
      },
    } = store;

    return (
      <div className={style('artist-list')}>
        <ul>
          {artists.map(artist => (
            <Artist
              key={artist}
              name={artist}
              selected={artist === selected}
              onClick={() => changeArtist(artist)}
            />
          ))}
        </ul>
      </div>
    );
  }
}
