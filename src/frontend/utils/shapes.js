import PropTypes from 'prop-types';

export const artistShape = PropTypes.string;

export const albumShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
});

export const trackShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
});

export const coverShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
});

export const discShape = PropTypes.shape({
  number: PropTypes.number,
  title: PropTypes.string,
  images: PropTypes.arrayOf(coverShape),
  tracks: PropTypes.arrayOf(trackShape),
});

export const stateShape = PropTypes.shape({
  state: PropTypes.string.isRequired,
});

export const configShape = PropTypes.shape({
  libraryPath: PropTypes.string,
});

export const iconShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    prefix: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired,
    icon: PropTypes.array.isRequired,
  }),
]);
