import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const poserStyle = ({ position, duration }) => {
  const right = 100 - ((position / duration) * 100);

  return {
    position: 'absolute',
    top: 0,
    right: `${right}%`,
    bottom: 0,
    left: 0,
  };
};

let Seeker = ({ position, duration, handleClick }) => (
  <div className="seeker" onClick={handleClick}>
    <div className="poser" style={poserStyle({ position, duration })} />
  </div>
);

Seeker.propTypes = {
  duration: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired,
  onSeek: PropTypes.func.isRequired,
  handleClick: PropTypes.func.isRequired,
};

Seeker = connect(
  null,
  (dispatch, props) => ({
    handleClick({ currentTarget, clientX }) {
      const width = currentTarget.clientWidth;
      const pos = clientX - currentTarget.offsetLeft;
      const f = pos / width;
      props.onSeek(props.duration * f);
    },
  }),
)(Seeker);

export { Seeker };
