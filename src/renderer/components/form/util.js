import PropTypes from 'prop-types';
import { PropTypes as MobXPropTypes } from 'mobx-react';

export const modelShape = PropTypes.oneOfType([
  MobXPropTypes.observableArray,
  MobXPropTypes.observableObject,
]);

export const formShape = PropTypes.shape({
  model: modelShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
});
