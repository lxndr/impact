import _, {bindKey} from 'lodash';
import {remote} from 'electron';
import React from 'react';

const store = remote.require('./store');

export class ArtistList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      artists: []
    };
  }

  render() {
    return (
      <artist-list>
        <ul>
          {this.state.artists.map(artist => (
            <li key={artist}>
              <a href="#" onClick={bindKey(this, '_onSelect', artist)}>
                {artist}
              </a>
            </li>
          ))}
        </ul>
      </artist-list>
    );
  }

  componentDidMount() {
    store.collection.artists().then(artists => {
      this.setState({artists});
    }, err => {
      console.error(err.message);
    });
  }

  _onSelect(artist) {
    console.log(`Artist ${artist} selected`);
    this.props.onSelect(artist);
  }
}

ArtistList.propTypes = {
  onSelect: React.PropTypes.func
};
