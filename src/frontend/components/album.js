import React from 'react';
import PropTypes from 'prop-types';
import Disc from './album-disc';

export default class Album extends React.Component {
  static propTypes = {
    album: PropTypes.object.isRequired,
    playingTrack: PropTypes.object,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    playingTrack: null
  }

  render() {
    const {album, playingTrack, onSelect} = this.props;

    return (
      <div className="album">
        <div className="header">
          <div className="title">{album.title || 'Unknown album'}</div>
          <div className="release-date">{album.releaseDate}</div>
        </div>

        {album.discs.map(disc => {
          const showTitle = Boolean(disc.title || album.discs.length > 1);

          return (
            <Disc
              key={disc.id}
              disc={disc}
              showTitle={showTitle}
              playingTrack={playingTrack}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    );
  }
}
