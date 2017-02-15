import _ from 'lodash';
import React from 'react';
import {ArtistList} from './artist-list';
import {ArtistTrackList} from './artist-track-list';

export class Library extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <library>
        <ArtistList onSelect={artist => this.setState({artist})}/>
        <ArtistTrackList artist={this.state.artist}/>
      </library>
    );
  }
}

Library.propTypes = {
};
