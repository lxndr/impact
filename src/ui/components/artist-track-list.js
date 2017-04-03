import _, {noop} from 'lodash';
import React from 'react';
import {playback, collection} from '../store';

class TrackList extends React.Component {
  static propTypes = {
    tracks: React.PropTypes.array,
    playingTrack: React.PropTypes.object,
    onSelect: React.PropTypes.func
  }

  static defaultProps = {
    tracks: [],
    playingTrack: null,
    onSelect: noop
  }

  render() {
    const {tracks, onSelect} = this.props;

    return (
      <ul className="track-list">
        {tracks.map(track => {
          const playing = playback.track$.value && track._id === playback.track$.value._id;
          const className = playing ? 'playing' : undefined;

          return (
            <li key={track._id} className={className}>
              <a href="#" onClick={_.partial(onSelect, track)}>
                <span className="number">{track.number}</span>
                <span className="title">{track.title}</span>
                <span className="duration"> ({track.duration} secs)</span>
              </a>
            </li>
          );
        })}
      </ul>
    );
  }
}

class Disc extends React.Component {
  static propTypes = {
    number: React.PropTypes.number,
    title: React.PropTypes.string,
    tracks: React.PropTypes.array,
    image: React.PropTypes.string,
    onSelect: React.PropTypes.func
  }

  static defaultProps = {
    number: 1,
    title: null,
    tracks: [],
    image: null,
    onSelect: noop
  }

  render() {
    const {number, title, tracks, image = 'images/album.svg', onSelect} = this.props;

    return (
      <disc>
        {(number || title) &&
          <div className="disc-title">{
            title ? `Disc ${number}: ${title}` : `Disc ${number}`
          }</div>
        }
        <div className="cover-container">
          <img className="cover" src={image}/>
        </div>
        <TrackList tracks={tracks} onSelect={onSelect}/>
      </disc>
    );
  }
}

class Album extends React.Component {
  static propTypes = {
    title: React.PropTypes.string,
    releaseDate: React.PropTypes.string,
    discs: React.PropTypes.array,
    onSelect: React.PropTypes.func
  }

  static defaultProps = {
    title: null,
    releaseDate: null,
    discs: [],
    onSelect: noop
  }

  render() {
    const {title, releaseDate, discs, onSelect} = this.props;

    return (
      <album>
        <div className="album-title">{title}</div>
        <div className="release-date">{releaseDate}</div>
        {discs.map((disc, index) => (
          <Disc key={index} {...disc} onSelect={onSelect}/>
        ))}
      </album>
    );
  }
}

export class ArtistTrackList extends React.Component {
  static propTypes = {
    artist: React.PropTypes.string.isRequired
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
    // this.updateSubscription = collection.update$.subscribe(bindKey(this, '_update'));
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

    playback.setupPlaylist('list', list).then(() => {
      playback.play(track._id);
    });
  }

  _fetch(artist) {
    collection.allOfArtist(artist).then(tracks => {
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
