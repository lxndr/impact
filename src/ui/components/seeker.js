import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';

export class Seeker extends React.Component {
  static propTypes = {
    duration: PropTypes.number.isRequired,
    position: PropTypes.number.isRequired,
    onSeek: PropTypes.func.isRequired
  }

  render() {
    const right = 100 - (this.props.position / this.props.duration * 100);

    const poserStyle = {
      position: 'absolute',
      top: 0,
      right: `${right}%`,
      bottom: 0,
      left: 0
    };

    return (
      <div className="seeker" onClick={this.handleClick}>
        <div className="poser" style={poserStyle}/>
      </div>
    );
  }

  @autobind
  handleClick(event) {
    const {currentTarget} = event;
    const width = currentTarget.clientWidth;
    const pos = event.clientX - currentTarget.offsetLeft;
    const f = pos / width;
    this.props.onSeek(this.props.duration * f);
  }
}
