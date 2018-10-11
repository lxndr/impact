import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iconShape } from '../../utils';

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

Button.propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: iconShape.isRequired,
  title: PropTypes.string.isRequired,
};

export default Button;
