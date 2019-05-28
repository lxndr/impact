import React from 'react';

const CollectionTrackList = ({ tracks }) => {
  return (
    <div className="collection-track-list">
      {tracks.map(track => (
        <div>{track.title}</div>
      ))}
    </div>
  );
};

export default CollectionTrackList;
