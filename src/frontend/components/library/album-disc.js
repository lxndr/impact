import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { discShape, trackShape } from '../../utils';
import { AlbumTrackList } from './album-track-list';

const displayTitle = disc => (disc.title ? `Disc ${disc.number}: ${disc.title}` : `Disc ${disc.number}`);

export const AlbumDisc = ({
  disc,
  showTitle,
  playingTrack,
  onSelect,
}) => (
  <div className="disc">
    {showTitle && <div className="disc-title">{displayTitle(disc)}</div>}

    <div className="cover-container">
      {disc.images && disc.images.map(image => (
        <img alt="album cover" key={image.id} className="cover" src={image.path} />
      ))}
    </div>

    {disc.tracks && (
      <AlbumTrackList tracks={disc.tracks} playingTrack={playingTrack} onSelect={onSelect} />
    )}
  </div>
);

AlbumDisc.propTypes = {
  disc: discShape.isRequired,
  showTitle: PropTypes.bool,
  playingTrack: trackShape,
  onSelect: PropTypes.func,
};

AlbumDisc.defaultProps = {
  showTitle: true,
  playingTrack: null,
  onSelect: _.noop,
};
