import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import {withBackend} from '../backend-context';
import Album from './album';

@withBackend
export default class ArtistTrackList extends React.Component {
  static propTypes = {
    backend: PropTypes.any.isRequired,
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
    const {backend, artist} = this.props;

    this._trackSub = backend.playback.track$.subscribe(playingTrack => {
      this.setState({playingTrack});
    });

    this._fetch(artist).catch(console.error);
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
              key={album.id}
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
    const {backend} = this.props;

    Promise.resolve().then(async () => {
      const playlist = backend.createPlaylist();
      await playlist.forArtist(this.props.artist);
      backend.playback.playlist = playlist;
      backend.playback.play(track.id);
    }, console.error);
  }

  async _fetch(artist) {
    const {backend} = this.props;
    const {albums, tracks} = await backend.collection.allOfArtist(artist);

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
          id: [_album.title, _album.releaseDate].join('/'),
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
          id: _album.id,
          number: _album.discNumber,
          title: _album.discTitle,
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
              .filter({album: disc.id})
              .sortBy('number')
              .each(track => {
                album.duration += track.duration;
                disc.duration += track.duration;
              });
          });
      });
  }
}
