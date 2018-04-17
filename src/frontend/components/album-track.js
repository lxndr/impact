import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import {autobind} from 'core-decorators';
import {formatDuration} from '../util';

export default class Track extends React.PureComponent {
  static propTypes = {
    track: PropTypes.object.isRequired,
    playing: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
  }

  render() {
    const {track, playing} = this.props;

    return (
      <li className={cn({playing})} onClick={this.handleClick}>
        <FontAwesomeIcon className="play-icon" icon="play"/>
        <div className="number">{track.number}</div>
        <div className="title">{track.title || 'Unknown title'}</div>
        <div className="duration">{formatDuration(track.duration)}</div>
      </li>
    );
  }

  @autobind
  handleClick() {
    this.props.onClick(this.props.track);
  }
}
