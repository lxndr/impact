import React, { useState } from 'react';

import {
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

import { backend } from '../../services';
import style from '../../style';
import { Button } from '../common';
import Collection from './collection';
import CollectionEditor from './collection-editor';

/**
 * @typedef {import('common/types').DbCollection} DbCollection
 * @typedef {import('common/types').NewDbCollection} NewDbCollection
 */

/** @type {NewDbCollection?} */
const initialEditingCollection = null;

/** @type {NewDbCollection?} */
const newCollection = {
  title: '',
  abbr: '',
  color: 'red',
  tracks: [],
};

/**
 * @param {object} props
 * @param {DbCollection[]} props.collections
 * @param {DbCollection} [props.selectedCollection]
 * @param {() => void} props.onChange
 */
const CollectionList = ({
  collections,
  selectedCollection,
  onChange,
}) => {
  const [editing, setEditing] = useState(initialEditingCollection);

  const handleAdd = () => setEditing(newCollection);

  /** @param {NewDbCollection} collection */
  const handleEdit = (collection) => {
    if (editing) {
      return;
    }

    setEditing(collection);
  };

  /** @param {NewDbCollection} collection */
  const handleRemove = (collection) => {
    if (editing) {
      return;
    }

    if (!confirm('Are you sure you want to delete this?')) {
      return;
    }

    backend.database.collections
      .remove({ _id: collection._id })
      .then(onChange);
  };

  /** @param {NewDbCollection} collection */
  const handleChange = collection => setEditing(collection);

  const handleSave = () => {
    if (!editing) {
      return;
    }

    if (!editing.title) {
      alert('need a title');
      return;
    }

    backend.database.collections
      .update({ _id: editing._id }, editing, { upsert: true })
      .then(onChange)
      .finally(() => {
        setEditing(null);
      });
  };

  const handleCancel = () => setEditing(null);

  return (
    <div className={style('collection-list')}>
      <ul>
        {collections.map(collection => (
          (editing && editing._id === collection._id) ? (
            <CollectionEditor
              key={editing._id}
              value={editing}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <Collection
              key={collection._id}
              collection={collection}
              selected={collection === selectedCollection}
              onEdit={() => handleEdit(collection)}
              onRemove={() => handleRemove(collection)}
            />
          )
        ))}

        {(editing && !editing._id) && (
          <CollectionEditor
            key=""
            value={editing}
            onChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {!editing && (
          <li className="add" key="">
            <Button className="add" icon={faPlus} title="Add" onClick={handleAdd} />
          </li>
        )}
      </ul>
    </div>
  );
};

export default CollectionList;
