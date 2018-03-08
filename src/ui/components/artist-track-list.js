import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import cn from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {formatDuration} from '../util';

class Track extends React.PureComponent {
  static propTypes = {
    track: PropTypes.object.isRequired,
    playing: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
  }

  render() {
    const {track, playing} = this.props;

    return (
      <li key={track._id} className={cn({playing})} onClick={this.handleClick}>
        <FontAwesomeIcon className="play-icon" icon="play"/>
        <div className="number">{track.number}</div>
        <div className="title">{track.title || 'Unknown title'}</div>
        <div className="duration">{formatDuration(track.duration)}</div>
      </li>
    );
  }

  @autobind
  handleClick() {
    this.props.onClick(this.props.track);
  }
}

class TrackList extends React.PureComponent {
  static propTypes = {
    tracks: PropTypes.array,
    playingTrack: PropTypes.object,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    tracks: [],
    playingTrack: null
  }

  render() {
    const {tracks, playingTrack, onSelect} = this.props;

    return (
      <ul className="track-list">
        {tracks.map(track => {
          const playing = playingTrack && playingTrack._id === track._id;
          return <Track key={track._id} track={track} playing={playing} onClick={onSelect}/>;
        })}
      </ul>
    );
  }
}

class Disc extends React.PureComponent {
  static propTypes = {
    number: PropTypes.number,
    title: PropTypes.string,
    tracks: PropTypes.array,
    image: PropTypes.string,
    playingTrack: PropTypes.object,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    number: 1,
    title: null,
    tracks: [],
    image: null,
    playingTrack: null
  }

  render() {
    const {number, title, tracks, image = 'images/album.svg', playingTrack, onSelect} = this.props;

    return (
      <div className="disc">
        {(number || title) &&
          <div className="disc-title">
            {title ? `Disc ${number}: ${title}` : `Disc ${number}`}
          </div>
        }
        <div className="cover-container">
          <img className="cover" src={image}/>
        </div>
        <TrackList tracks={tracks} playingTrack={playingTrack} onSelect={onSelect}/>
      </div>
    );
  }
}

class Album extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    releaseDate: PropTypes.string,
    discs: PropTypes.array,
    playingTrack: PropTypes.object,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    title: null,
    releaseDate: null,
    discs: [],
    playingTrack: null
  }

  render() {
    const {title, releaseDate, discs, playingTrack, onSelect} = this.props;

    return (
      <div className="album">
        <div className="album-title">{title || 'Unknown album'}</div>
        <div className="release-date">{releaseDate}</div>
        {discs.map(disc => (
          <Disc key={disc._id} {...disc} playingTrack={playingTrack} onSelect={onSelect}/>
        ))}
      </div>
    );
  }
}

export class ArtistTrackList extends React.Component {
  static contextTypes = {
    app: PropTypes.any
  }

  static propTypes = {
    artist: PropTypes.string
  }

  static defaultProps = {
    artist: null
  }

  state = {
    albums: [],
    tracks: [],
    playingTrack: null
  }

  componentDidMount() {
    const {app} = this.context;

    this._trackSub = app.playback.track$.subscribe(playingTrack => {
      this.setState({playingTrack});
    });

    this._fetch(this.props.artist).catch(console.error);
  }

  componentWillReceiveProps(props) {
    this._fetch(props.artist).catch(console.error);
  }

  componentWillUnmount() {
    this._trackSub.unsubscribe();
  }

  render() {
    const {playingTrack} = this.state;
    const albums = this.formAlbumList();

    return (
      <div className="artist-track-list">
        {albums.map(album => {
          const key = [album.title, album.releaseDate].join('/');
          return <Album key={key} {...album} playingTrack={playingTrack} onSelect={this.handleSelect}/>;
        })}
      </div>
    );
  }

  @autobind
  handleSelect(track) {
    const {app} = this.context;

    Promise.resolve().then(async () => {
      const playlist = app.createPlaylist();
      await playlist.forArtist(this.props.artist);
      app.playback.playlist = playlist;
      app.playback.play(track._id);
    }, console.error);
  }

  async _fetch(artist) {
    const {app} = this.context;
    const {albums, tracks} = await app.collection.allOfArtist(artist);

    this.setState({
      albums: _.cloneDeep(albums),
      tracks: _.cloneDeep(tracks)
    });
  }

  formAlbumList() {
    const albums = [];

    for (const _album of this.state.albums) {
      let album = _.find(albums, {
        title: _album.title,
        releaseDate: _album.releaseDate
      });

      if (!album) {
        album = {
          title: _album.title,
          releaseDate: _album.releaseDate,
          originalDate: _album.originalDate,
          duration: 0,
          discs: []
        };

        albums.push(album);
      }

      let disc = _.find(album.discs, {number: _album.discNumber});

      if (!disc) {
        disc = {
          _id: _album._id,
          number: _album.discNumber,
          title: _album.discSubtitle,
          duration: 0,
          tracks: []
        };

        album.discs.push(disc);
      }
    }

    return _(albums)
      .sortBy('releaseDate')
      .each(album => {
        album.discs = _(album.discs)
          .sortBy('number')
          .each(disc => {
            disc.tracks = _(this.state.tracks)
              .filter({album: disc._id})
              .sortBy('number')
              .each(track => {
                album.duration += track.duration;
                disc.duration += track.duration;
              });
          });
      });
  }
}
