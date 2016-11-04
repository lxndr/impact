import _, {bindKey} from 'lodash';
import {remote} from 'electron';
import React from 'react';

const store = remote.require('./store');

function TrackList(props) {
  return (
    <ul className="track-list">
      {props.tracks.map(track => (
        <li key={track._id} className="track">
          <a href="#" onClick={_.partial(props.onSelect, track)}>
            <span className="number">{track.number}</span>
            <span className="title">{track.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

TrackList.propTypes = {
  tracks: React.PropTypes.array,
  onSelect: React.PropTypes.func
};

function Disc(props) {
  return (
    <disc>
      {props.title &&
        <div className="title">{props.title}</div>
      }
      <img className="cover" src="images/album.svg" />
      <TrackList tracks={props.tracks} onSelect={props.onSelect} />
    </disc>
  );
}

Disc.propTypes = {
  title: React.PropTypes.string,
  tracks: React.PropTypes.array,
  onSelect: React.PropTypes.func
};

Disc.defaultProps = {
  title: null,
  tracks: []
};

function Album(props) {
  return (
    <album>
      <div className="title">{props.title}</div>
      <div className="release-date">{props.releaseDate}</div>
      {props.discs.map((disc, index) => (
        <Disc key={index} {...disc} onSelect={props.onSelect} />
      ))}
    </album>
  );
}

Album.propTypes = {
  title: React.PropTypes.string,
  releaseDate: React.PropTypes.string,
  discs: React.PropTypes.array,
  onSelect: React.PropTypes.func
};

Album.defaultProps = {
  title: null,
  discs: []
};

export class ArtistTrackList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: []
    };
  }

  render() {
    return (
      <artist-track-list>
        {this.state.albums.map((album, index) => (
          <Album key={index} {...album} onSelect={this._onSelect} />
        ))}
      </artist-track-list>
    );
  }

  componentDidMount() {
    this._fetch(this.props.artist);
  }

  componentWillReceiveProps(props) {
    this._fetch(props.artist);
  }

  _fetch(artist) {
    store.collection.allOfArtist(artist).then(tracks => {
      const albums = [];

      tracks = _.cloneDeep(tracks);

      _(tracks).sortBy('number').forEach(track => {
        let album = _.find(albums, {title: track.album});

        if (!album) {
          album = {
            title: track.album,
            discs: [{
              tracks: []
            }]
          };

          albums.push(album);
        }

        album.discs[0].tracks.push(track);
      });

      this.setState({albums});
    }, err => {
      console.error(err.message);
    });
  }

  _onSelect(track) {
    console.log(`Track selected:`, track);
    store.playback.play(track);
  }
}

ArtistTrackList.propTypes = {
  artist: React.PropTypes.string
};
