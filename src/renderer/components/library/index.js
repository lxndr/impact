import React from 'react';
import { observer } from 'mobx-react';
import store from '../../store';
import style from '../../style';
import Empty from './empty';
import ArtistList from './artist-list';
import AlbumList from './album-list';

const Library = observer(() => {
  const {
    library: { artists },
  } = store;

  if (!artists.length) {
    return <Empty />;
  }

  return (
    <div className={style('app-library')}>
      <ArtistList />
      <AlbumList />
    </div>
  );
});

export default Library;
