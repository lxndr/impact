import React, { useState, useEffect } from 'react';
import style from '../../style';
import Empty from './empty';
import ArtistList from './artist-list';
import AlbumList from './album-list';
import backend from '../../services/backend';
import { formAlbumList, usePlayingTrack } from '../../services';

/**
 * @typedef {import('react-router').match} Match
 * @typedef {import('common/types').Album} Album
 * @typedef {import('common/types').Track} Track
 */

const useArtists = () => {
  /** @type {string[]} */
  const defaultArtists = [];
  const [artists, setArtists] = useState(defaultArtists);

  const fetchArtists = () => {
    backend.collection.artists().then((artists) => {
      setArtists(artists);
    });
  };

  useEffect(() => {
    fetchArtists();

    const sub = backend.collection.update$.subscribe(
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
    backend.collection.allOfArtist(artist).then((result) => {
      const albums = formAlbumList(result);
      setAlbums(albums);
    });
  };

  useEffect(() => {
    fetchAlbums();

    const sub = backend.collection.update$.subscribe(
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
  const playingTrack = usePlayingTrack();

  /** @param {Track} track */
  const handlePlay = (track) => {
    backend.playback.play(track._id);
  };

  if (!artists.length) {
    return <Empty />;
  }

  return (
    <div className={style('app-library')}>
      <ArtistList
        artists={artists}
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
