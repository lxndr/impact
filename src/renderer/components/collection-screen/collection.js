import React from 'react';
import cn from 'classnames';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link, generatePath } from 'react-router-dom';
import { Button } from '../common';

/**
 * @typedef {import('common/types').DbCollection} DbCollection
 */

/** @param {DbCollection} collection */
const createCollectionUrl = collection => (
  generatePath('/collections/:id', { id: collection._id })
);

/**
 * @param {object} props
 * @param {DbCollection} props.collection
 * @param {boolean} props.selected
 * @param {() => void} props.onEdit
 * @param {() => void} props.onRemove
 */
const Collection = ({
  collection,
  selected,
  onEdit,
  onRemove,
}) => (
  <li className={cn({ selected })}>
    <Link to={createCollectionUrl(collection)} draggable={false}>
      <span className="abbr" style={{ background: collection.color }}>{collection.abbr}</span>
      <span className="title">{collection.title}</span>

      <Button className="edit" icon={faEdit} title="Edit" onClick={onEdit} />
      <Button className="remove" icon={faTrash} title="Remove" onClick={onRemove} />
    </Link>
  </li>
);

export default Collection;
