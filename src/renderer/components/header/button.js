import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/** @typedef {import('@fortawesome/fontawesome-svg-core').IconProp} IconProp */

/**
 * @param {object} props
 * @param {string} props.className
 * @param {IconProp} props.icon
 * @param {string} props.title
 * @param {React.MouseEventHandler} props.onClick
 */
const Button = ({
  className,
  onClick,
  icon,
  title,
}) => (
  <button
    type="button"
    className={className}
    onClick={onClick}
    title={title}
  >
    <FontAwesomeIcon icon={icon} />
  </button>
);

export default React.memo(Button);
