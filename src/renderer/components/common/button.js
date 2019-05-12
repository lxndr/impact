import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/** @typedef {import('@fortawesome/fontawesome-svg-core').IconProp} IconProp */

/**
 * @param {object} props
 * @param {string} props.className
 * @param {IconProp} [props.icon]
 * @param {string} [props.label]
 * @param {string} props.title
 * @param {boolean} [props.disabled]
 * @param {React.MouseEventHandler} props.onClick
 */
const Button = ({
  className,
  onClick,
  icon,
  label,
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
    {icon && <FontAwesomeIcon icon={icon} />}
    {label}
  </button>
);

export default Button;
