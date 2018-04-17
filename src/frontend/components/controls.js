import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router';
import {ipcRenderer} from 'electron';
import {autobind} from 'core-decorators';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {withBackend} from '../backend-context';
import Seeker from './seeker';

@withRouter
@withBackend
export default class Controls extends React.Component {
  static propTypes = {
    backend: PropTypes.any.isRequired,
    history: PropTypes.object.isRequired
  }

  state = {
    track: null,
    state: null
  }

  componentDidMount() {
    const {backend} = this.props;

    this._trackSub = backend.playback.track$.subscribe(track => {
      this.setState({track});
    });

    this._stateSub = backend.playback.state$.subscribe(state => {
      this.setState({state});
    });
  }

  componentWillUnmount() {
    this._trackSub.unsubscribe();
    this._stateSub.unsubscribe();
  }

  render() {
    const {track, state} = this.state;
    let title = null;
    let album = null;
    let playing = false;
    let duration = 0;
    let position = 0;

    if (track) {
      const _artist = track.album.artist || 'Unknown artist';
      const _album = track.album.title || 'Unknown album';
      title = track.title || 'Unknown title';
      album = `by ${_artist} from ${_album}`;
      duration = track.duration;
    }

    if (state) {
      playing = state.state === 'playing';
      position = state.position;
    }

    return (
      <div className="media-controls">
        <div className="prev" onClick={this.handlePrevious}><FontAwesomeIcon icon="backward"/></div>
        <div className="play" onClick={this.handleToggle}><FontAwesomeIcon icon={playing ? 'pause' : 'play'}/></div>
        <div className="next" onClick={this.handleNext}><FontAwesomeIcon icon="forward"/></div>
        <div className="wmin" onClick={this.handleMinimize}><FontAwesomeIcon icon="window-minimize"/></div>
        <div className="wmax" onClick={this.handleMaximize}><FontAwesomeIcon icon="window-maximize"/></div>
        <div className="wcls" onClick={this.handleClose}><FontAwesomeIcon icon="window-close"/></div>
        <div className="pref" onClick={this.handlePreferences}><FontAwesomeIcon icon="cog"/></div>
        <img className="cover" src="images/album.svg"/>
        <div className="title">{title}</div>
        <div className="album">{album}</div>
        <Seeker duration={duration} position={position} onSeek={this.handleSeek}/>
      </div>
    );
  }

  @autobind
  handleSeek(time) {
    const {backend} = this.props;
    backend.playback.seek(time);
  }

  @autobind
  handlePrevious() {
    const {backend} = this.props;
    backend.playback.previous();
  }

  @autobind
  handleToggle() {
    const {backend} = this.props;
    backend.playback.toggle();
  }

  @autobind
  handleNext() {
    const {backend} = this.props;
    backend.playback.next();
  }

  @autobind
  handleMinimize() {
    ipcRenderer.send('window/minimize');
  }

  @autobind
  handleMaximize() {
    ipcRenderer.send('window/maximize');
  }

  @autobind
  handleClose() {
    ipcRenderer.send('window/close');
  }

  @autobind
  handlePreferences() {
    const {history} = this.props;
    history.push('/preferences');
  }
}
