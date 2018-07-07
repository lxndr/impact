import React from 'react';
import PropTypes from 'prop-types';

export default class Seeker extends React.Component {
  static propTypes = {
    duration: PropTypes.number.isRequired,
    position: PropTypes.number.isRequired,
    onSeek: PropTypes.func.isRequired,
  }

  handleClick = ({ currentTarget, clientX }) => {
    const { onSeek, duration } = this.props;
    const width = currentTarget.clientWidth;
    const pos = clientX - currentTarget.offsetLeft;
    const f = pos / width;
    onSeek(duration * f);
  }

  handleKeyPress = () => {
  }

  render() {
    const { position, duration } = this.props;

    const right = 100 - ((position / duration) * 100);

    const style = {
      position: 'absolute',
      top: 0,
      right: `${right}%`,
      bottom: 0,
      left: 0,
    };

    return (
      <div
        className="seeker"
        role="slider"
        aria-valuemax={duration}
        aria-valuemin={0}
        aria-valuenow={position}
        tabIndex={0}
        onClick={this.handleClick}
        onKeyPress={this.handleKeyPress}
      >
        <div className="poser" style={style} />
      </div>
    );
  }
}
