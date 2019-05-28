import React from 'react';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common';
import { createCollectionAbbreviation } from '../../services';

/**
 * @typedef {import('common/types').DbCollection} DbCollection
 */

/**
 * @param {object} props
 * @param {DbCollection} props.value
 * @param {(collection: DbCollection) => void} props.onChange
 * @param {() => void} props.onSave
 * @param {() => void} props.onCancel
 */
const CollectionEditor = ({
  value,
  onChange,
  onSave,
  onCancel,
}) => {
  /** @param {React.ChangeEvent<HTMLInputElement>} event */
  const handleChange = ({ target }) => {
    onChange({
      ...value,
      title: target.value,
      abbr: createCollectionAbbreviation(target.value),
    });
  };

  /** @param {React.KeyboardEvent<HTMLInputElement>} event */
  const handleKeyDown = ({ key }) => {
    switch (key) {
      case 'Enter':
        onSave();
        break;
      case 'Escape':
        onCancel();
        break;
      default:
    }
  };

  const abbr = value.abbr || '\xa0';

  return (
    <li className="editor">
      <span className="abbr" style={{ background: value.color }}>{abbr}</span>

      <input
        type="text"
        autoFocus
        value={value.title}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
      />

      <Button className="save" icon={faSave} title="Save" onClick={onSave} />
      <Button className="cancel" icon={faTimes} title="Cancel" onClick={onCancel} />
    </li>
  );
};

export default CollectionEditor;
