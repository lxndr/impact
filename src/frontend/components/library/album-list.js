import React from 'react';
import { observer } from 'mobx-react';
import { store } from '../../store';
import { Album } from './album';

@observer
export class AlbumList extends React.Component {
  render() {
    const {
      library: {
        albums,
      },
      playback: {
        track,
        play,
      },
    } = store;

    return (
      <div className="album-list">
        {albums.map(album => (
          <Album
            key={album.id}
            album={album}
            playingTrack={track}
            onSelect={play}
          />
        ))}
      </div>
    );
  }
}
