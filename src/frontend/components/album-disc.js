import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import TrackList from './album-track-list';

export default class Disc extends React.Component {
  static propTypes = {
    disc: PropTypes.object.isRequired,
    showTitle: PropTypes.bool,
    playingTrack: PropTypes.object,
    onSelect: PropTypes.func
  }

  static defaultProps = {
    showTitle: true,
    playingTrack: null,
    onSelect: _.noop
  }

  render() {
    const {disc, showTitle, playingTrack, onSelect} = this.props;
    const displayTitle = disc.title ?
      `Disc ${disc.number}: ${disc.title}` :
      `Disc ${disc.number}`;

    return (
      <div className="disc">
        {showTitle && <div className="disc-title">{displayTitle}</div>}
        <div className="cover-container">
          {disc.images && disc.images.map(image => (
            <img key={image.id} className="cover" src={image.path}/>
          ))}
        </div>
        {disc.tracks &&
          <TrackList tracks={disc.tracks} playingTrack={playingTrack} onSelect={onSelect}/>
        }
      </div>
    );
  }
}
