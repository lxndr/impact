import React from 'react';
import {autobind} from 'core-decorators';
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
        <ArtistList onSelect={this.handleArtistSelect}/>
        <ArtistTrackList artist={this.state.artist}/>
      </library>
    );
  }

  @autobind
  handleArtistSelect(artist) {
    this.setState({artist});
  }
}
