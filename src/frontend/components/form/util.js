import PropTypes from 'prop-types';
import { observableArray, observableObject } from 'mobx';

export const modelShape = PropTypes.oneOfType([
  observableArray,
  observableObject,
]);

export const formShape = PropTypes.shape({
  model: modelShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
});
