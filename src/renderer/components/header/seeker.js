import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

@observer
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

  handleKeyDown = ({ key, shiftKey }) => {
    const { position, onSeek } = this.props;
    const delta = shiftKey ? 5 : 1;

    switch (key) {
      case 'ArrowLeft':
        onSeek(position - delta);
        break;
      case 'ArrowRight':
        onSeek(position + delta);
        break;
      default:
        break;
    }
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
        onKeyDown={this.handleKeyDown}
      >
        <div className="poser" style={style} />
      </div>
    );
  }
}
