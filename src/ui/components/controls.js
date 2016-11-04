import _ from 'lodash';
import React from 'react';

export class Controls extends React.Component {
  render() {
    const track = this.props.track || {};

    return (
      <media-controls>
        <img className="cover" src="images/album.svg" />
        <div className="track-info">
          <div className="artist">{track.artist}</div>
          <div className="album">{track.album}</div>
          <div className="title">{track.title}</div>
        </div>
        <div>
          <button onClick={this.props.onPrevious}>Previous</button>
          <button onClick={this.props.onToggle}>Play</button>
          <button onClick={this.props.onNext}>Next</button>
        </div>
      </media-controls>
    );
  }
}

Controls.propTypes = {
  track: React.PropTypes.object,
  onPrevious: React.PropTypes.func,
  onToggle: React.PropTypes.func,
  onNext: React.PropTypes.func
};
