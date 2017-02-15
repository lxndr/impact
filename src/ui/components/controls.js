import _ from 'lodash';
import {remote} from 'electron';
import React from 'react';

const store = remote.require('./store');

export class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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
          <button onClick={store.previous}>Previous</button>
          <button onClick={store.toggle}>Play</button>
          <button onClick={store.next}>Next</button>
        </div>
      </media-controls>
    );
  }

  componentDidMount() {
    this._trackSub = store.playback.track$.subscribe(track => {
      this.setState({track});
    });
  }

  componentWillUnmount() {
    this._trackSub.unsubscribe();
  }
}
