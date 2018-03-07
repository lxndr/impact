import React from 'react';
import PropTypes from 'prop-types';
import {ipcRenderer} from 'electron';
import {autobind} from 'core-decorators';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

export class Controls extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    app: PropTypes.any
  }

  state = {
    track: null,
    state: null
  }

  componentDidMount() {
    const {app} = this.context;

    this._trackSub = app.playback.track$.subscribe(track => {
      this.setState({track});
    });

    this._stateSub = app.playback.state$.subscribe(state => {
      this.setState({state});
    });
  }

  componentWillUnmount() {
    this._trackSub.unsubscribe();
    this._stateSub.unsubscribe();
  }

  render() {
    const track = this.state.track || {album: {}};
    const state = this.state.state || {};
    const albumTitle = `by ${track.album.artist} from ${track.album.title}`;

    return (
      <div className="media-controls">
        <div className="prev" onClick={this.handlePrevious}><FontAwesomeIcon icon="backward"/></div>
        <div className="play" onClick={this.handleToggle}><FontAwesomeIcon icon={state.state === 'playing' ? 'pause' : 'play'}/></div>
        <div className="next" onClick={this.handleNext}><FontAwesomeIcon icon="forward"/></div>
        <div className="wmin" onClick={this.handleMinimize}><FontAwesomeIcon icon="window-minimize"/></div>
        <div className="wmax" onClick={this.handleMaximize}><FontAwesomeIcon icon="window-maximize"/></div>
        <div className="wcls" onClick={this.handleClose}><FontAwesomeIcon icon="window-close"/></div>
        <div className="pref" onClick={this.handlePreferences}>prefs</div>
        <img className="cover" src="images/album.svg"/>
        <div className="title">{track.title}</div>
        <div className="album">{albumTitle}</div>
        <div className="seek">
          {state.position}
        </div>
      </div>
    );
  }

  @autobind
  handlePrevious() {
    const {app} = this.context;
    app.playback.previous();
  }

  @autobind
  handleToggle() {
    const {app} = this.context;
    app.playback.toggle();
  }

  @autobind
  handleNext() {
    const {app} = this.context;
    app.playback.next();
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
    const {router} = this.context;
    router.history.push('/preferences');
  }
}
