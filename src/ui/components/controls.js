import _ from 'lodash';
import React from 'react';
import {playback} from '../store';

export class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleNext = this.handleNext.bind(this);
  }

  render() {
    const track = this.state.track || {};

    return (
      <media-controls>
        <img className="cover" src="images/album.svg"/>
        <div className="track-info">
          <div className="album-artist">{track.albumArtist}</div>
          <div className="album">{track.album}</div>
          <div className="title">{track.title}</div>
        </div>
        <div>
          <button onClick={this.handlePrevious}>Previous</button>
          <button onClick={this.handleToggle}>Play</button>
          <button onClick={this.handleNext}>Next</button>
        </div>
      </media-controls>
    );
  }

  componentDidMount() {
    this._trackSub = playback.track$.subscribe(track => {
      this.setState({track});
    });
  }

  componentWillUnmount() {
    this._trackSub.unsubscribe();
  }

  handlePrevious() {
    playback.previous();
  }

  handleToggle() {
    playback.toggle();
  }

  handleNext() {
    playback.next();
  }
}
