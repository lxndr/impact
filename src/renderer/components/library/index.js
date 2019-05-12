import React, { useState, useEffect } from 'react';
import { throttleTime } from 'rxjs/operators';
import { backend, getTracksFromAlbums } from '../../services';
import { useBehaviorSubject } from '../../utils';
import style from '../../style';
import Empty from './empty';
import ArtistList from './artist-list';
import AlbumList from './album-list';

/**
 * @typedef {import('react-router').match} Match
 * @typedef {import('common/types').Album} Album
 * @typedef {import('common/types').Track} Track
 */

const useArtists = () => {
  /** @type {string?[]} */
  const defaultArtists = [];
  const [artists, setArtists] = useState(defaultArtists);

  const fetchArtists = () => {
    backend.library.artists().then(setArtists);
  };

  useEffect(() => {
    fetchArtists();

    const sub = backend.library.update$
      .pipe(throttleTime(5000))
      .subscribe(
        () => fetchArtists(),
      );

    return () => sub.unsubscribe();
  }, []);

  return artists;
};

/**
 * @param {?string} artist
 */
const useAlbums = (artist) => {
  /** @type {Album[]} */
  const defaultAlbums = [];
  const [albums, setAlbums] = useState(defaultAlbums);

  const fetchAlbums = () => {
    backend.library.albumsByArtist(artist).then(setAlbums);
  };

  useEffect(() => {
    fetchAlbums();

    const sub = backend.library.update$
      .pipe(throttleTime(5000))
      .subscribe(
        () => fetchAlbums(),
      );

    return () => sub.unsubscribe();
  }, [artist]);

  return albums;
};

/**
 * @param {object} props
 * @param {Match} props.match
 */
const Library = ({ match }) => {
  const { artist } = match.params;
  const selectedArtist = artist ? decodeURIComponent(artist) : null;

  const artists = useArtists();
  const albums = useAlbums(selectedArtist);
  const playingTrack = useBehaviorSubject(backend.playback.track$);

  /** @param {Track} track */
  const handlePlay = async (track) => {
    const playlist = backend.createPlaylist();
    const tracks = getTracksFromAlbums(albums);
    playlist.forTracks(tracks);
    backend.playback.playlist = playlist;
    backend.playback.play(track);
  };

  if (!artists.length) {
    return <Empty />;
  }

  return (
    <div className={style('app-library')}>
      <ArtistList
        artists={artists}
        selectedArtist={selectedArtist}
      />

      <AlbumList
        albums={albums}
        playingTrack={playingTrack}
        onPlay={handlePlay}
      />
    </div>
  );
};

export default Library;
