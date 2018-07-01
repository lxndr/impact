import React from 'react';
import { ArtistList } from './artist-list';
import { AlbumList } from './album-list';

export const Library = () => (
  <div className="library">
    <ArtistList />
    <AlbumList />
  </div>
);
