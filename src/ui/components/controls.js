import React from 'react';
import {ipcRenderer} from 'electron';
import {playback} from '../store';

export class Controls extends React.Component {
  static propTypes = {
    history: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleMinimize = this.handleMinimize.bind(this);
    this.handleMaximize = this.handleMaximize.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handlePreferences = this.handlePreferences.bind(this);
  }

  render() {
    const track = this.state.track || {};

    return (
      <media-controls>
        <div className="playback">
          <div className="previous" onClick={this.handlePrevious}>&#171;</div>
          <div className="play" onClick={this.handleToggle}>&#9654;</div>
          <div className="next" onClick={this.handleNext}>&#187;</div>
        </div>
        <div className="window">
          <div className="minimize" onClick={this.handleMinimize}>_</div>
          <div className="maximize" onClick={this.handleMaximize}>&nbsp;</div>
          <div className="close" onClick={this.handleClose}>X</div>
        </div>
        <div className="preferences" onClick={this.handlePreferences}>prefs</div>
        <img className="cover" src="images/album.svg"/>
        <div className="track-info">
          <div className="album-artist">{track.albumArtist}</div>
          <div className="album">{track.album}</div>
          <div className="title">{track.title}</div>
        </div>
      </media-controls>
    );
  }

  componentDidMount() {
    this._trackSub = playback.track$.subscribe(track => {
      this.setState({track});
    });
  }

  componentWillUnmount() {
    this._trackSub.unsubscribe();
  }

  handlePrevious() {
    playback.previous();
  }

  handleToggle() {
    playback.toggle();
  }

  handleNext() {
    playback.next();
  }

  handleMinimize() {
    ipcRenderer.send('window/minimize');
  }

  handleMaximize() {
    ipcRenderer.send('window/maximize');
  }

  handleClose() {
    ipcRenderer.send('window/close');
  }

  handlePreferences() {
    this.props.history.push('/preferences');
  }
}
