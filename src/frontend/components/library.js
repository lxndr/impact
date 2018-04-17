import React from 'react';
import {autobind} from 'core-decorators';
import ArtistList from './artist-list';
import ArtistTrackList from './artist-track-list';

export default class Library extends React.Component {
  state = {}

  render() {
    return (
      <div className="library">
        <ArtistList onSelect={this.handleArtistSelect}/>
        <ArtistTrackList artist={this.state.artist}/>
      </div>
    );
  }

  @autobind
  handleArtistSelect(artist) {
    this.setState({artist});
  }
}
