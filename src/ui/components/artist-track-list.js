import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import {Album} from './album';
import {remoteCall} from '../remote-call';

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
          return (
            <Album
              key={album._id}
              album={album}
              playingTrack={playingTrack}
              onSelect={this.handleSelect}
            />
          );
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
    const {albums, tracks} = await remoteCall('app.collection.allOfArtist', artist);

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
          _id: [_album.title, _album.releaseDate].join('/'),
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
