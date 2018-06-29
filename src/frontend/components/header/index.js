import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { observer, inject } from 'mobx-react';

import {
  faBackward,
  faPause,
  faPlay,
  faForward,
  faWindowMinimize,
  faWindowMaximize,
  faWindowClose,
  faCog,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from './button';
import { Seeker } from './seeker';

@withRouter
@inject('store')
@observer
export class Header extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  showPreferences = () => {
    const { history } = this.props;
    history.push('/preferences');
  }

  render() {
    const { store } = this.props;
    const { state, displayedTrack } = store.playback;

    let playing = false;
    let position = 0;

    if (state) {
      playing = state.state === 'playing';
      position = state.position;
    }

    return (
      <div className="media-controls">
        <Button className="prev" onClick={store.playback.prev} icon={faBackward} />
        <Button className="play" onClick={store.playback.toggle} icon={playing ? faPause : faPlay} />
        <Button className="next" onClick={store.playback.next} icon={faForward} />
        <Button className="wmin" onClick={store.window.minimize} icon={faWindowMinimize} />
        <Button className="wmax" onClick={store.window.maximize} icon={faWindowMaximize} />
        <Button className="wcls" onClick={store.window.close} icon={faWindowClose} />
        <Button className="pref" onClick={this.showPreferences} icon={faCog} />

        <img className="cover" alt="Album cover" src="images/album.svg" />
        <div className="title">{displayedTrack.title}</div>
        <div className="album">{displayedTrack.album}</div>

        <Seeker
          duration={displayedTrack.duration}
          position={position}
          onSeek={store.playback.seek}
        />
      </div>
    );
  }
}
