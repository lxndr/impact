import R from 'ramda';
import React, { useState, useEffect } from 'react';
import CollectionList from './collection-list';
import CollectionTrackList from './collection-track-list';
import { backend } from '../../services';
import style from '../../style';

/**
 * @typedef {import('react-router').match} Match
 * @typedef {import('common/types').DbCollection} DbCollection
 */

/**
 * @param {object} props
 * @param {Match} props.match
 */
const CollectionScreen = ({ match }) => {
  const { id } = match.params;

  /** @type {DbCollection[]} */
  const defaultCollections = [];
  const [collections, setCollections] = useState(defaultCollections);

  const selectedCollection = collections.find(R.propEq('_id', id));
  const tracks = selectedCollection ? selectedCollection.tracks : [];

  const fetchCollections = () => backend.database.collections.find().then(setCollections);

  useEffect(() => {
    fetchCollections();
    const sub = backend.library.update$.subscribe(fetchCollections);
    return () => sub.unsubscribe();
  }, []);

  return (
    <div className={style('collection-screen')}>
      <CollectionList
        collections={collections}
        selectedCollection={selectedCollection}
        onChange={fetchCollections}
      />

      <CollectionTrackList tracks={tracks} />
    </div>
  );
};

export default CollectionScreen;
