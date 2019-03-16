import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/** @typedef {import('@fortawesome/fontawesome-svg-core').IconProp} IconProp */

/**
 * @param {object} props
 * @param {string} props.className
 * @param {IconProp} props.icon
 * @param {string} props.title
 * @param {boolean} [props.disabled]
 * @param {React.MouseEventHandler} props.onClick
 */
const Button = ({
  className,
  onClick,
  icon,
  title,
  disabled = false,
}) => (
  <button
    type="button"
    className={className}
    onClick={onClick}
    title={title}
    disabled={disabled}
  >
    <FontAwesomeIcon icon={icon} />
  </button>
);

export default Button;
