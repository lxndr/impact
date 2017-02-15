import _ from 'lodash';
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
        <div className="disc-title">{props.title}</div>
      }
      <img className="cover" src="images/album.svg"/>
      <TrackList tracks={props.tracks} onSelect={props.onSelect}/>
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
      <div className="album-title">{props.title}</div>
      <div className="release-date">{props.releaseDate}</div>
      {props.discs.map((disc, index) => (
        <Disc key={index} {...disc} onSelect={props.onSelect}/>
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
  static propTypes = {
    artist: React.PropTypes.string
  }

  state = {
    albums: []
  }

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    return (
      <artist-track-list>
        {this.state.albums.map((album, index) => (
          <Album key={index} {...album} onSelect={this.handleSelect}/>
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

  handleSelect(track) {
    const list = _(this.state.albums)
      .flatMap('discs')
      .flatMap('tracks')
      .map('_id')
      .value();

    store.playback.setupPlaylist('list', list).then(() => {
      store.playback.play(track._id);
    });
  }

  _fetch(artist) {
    store.collection.allOfArtist(artist).then(tracks => {
      let albums = [];

      _(tracks)
        .map(_.cloneDeep)
        .each(track => {
          let album = _.find(albums, {
            title: track.album,
            releaseDate: track.releaseDate
          });

          if (!album) {
            album = {
              title: track.album,
              releaseDate: track.releaseDate,
              originalDate: track.originalDate,
              duration: 0,
              discs: []
            };

            albums.push(album);
          }

          let disc = _.find(album.discs, {number: track.discNumber});

          if (!disc) {
            disc = {
              number: track.discNumber,
              title: track.discSubtitle,
              duration: 0,
              tracks: []
            };

            album.discs.push(disc);
          }

          album.duration += track.duration;
          disc.duration += track.duration;
          disc.tracks.push(track);
        });

      albums = _(albums)
        .sortBy('releaseDate')
        .each(album => {
          album.discs = _(album.discs)
            .sortBy('number')
            .each(disc => {
              disc.tracks = _.sortBy(disc.tracks, 'number');
            });
        });

      this.setState({albums});
    }, err => {
      console.error(err.message);
    });
  }
}
