import React from 'react';
import { withRouter } from 'react-router';
import { observer } from 'mobx-react';
import { injectIntl, intlShape } from 'react-intl';

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

import { historyShape } from '../../utils';
import store from '../../store';
import defaultAlbumCover from '../../assets/album.svg';
import Button from './button';
import Seeker from './seeker';

@withRouter
@injectIntl
@observer
export default class Header extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    history: historyShape.isRequired,
  }

  showPreferences = () => {
    const { history } = this.props;
    history.push('/preferences');
  }

  render() {
    const { intl } = this.props;
    const { state, displayedTrack } = store.playback;

    let playing = false;
    let position = 0;

    if (state) {
      playing = state.state === 'playing';
      position = state.position; // eslint-disable-line prefer-destructuring
    }

    return (
      <div className="header">
        <Button
          className="prev"
          onClick={store.playback.prev}
          icon={faBackward}
          title={intl.formatMessage({
            id: 'playback.prev',
            defaultMessage: 'Previous track',
          })}
        />

        <Button
          className="play"
          onClick={store.playback.toggle}
          icon={playing ? faPause : faPlay}
          title={intl.formatMessage({
            id: playing ? 'playback.pause' : 'playback.play',
            defaultMessage: playing ? 'Puase' : 'Play',
          })}
        />

        <Button
          className="next"
          onClick={store.playback.next}
          icon={faForward}
          title={intl.formatMessage({
            id: 'playback.next',
            defaultMessage: 'Next track',
          })}
        />

        <Button
          className="wmin"
          onClick={store.window.minimize}
          icon={faWindowMinimize}
          title={intl.formatMessage({
            id: 'window.minimize',
            defaultMessage: 'Minimize window',
          })}
        />

        <Button
          className="wmax"
          onClick={store.window.maximize}
          icon={faWindowMaximize}
          title={intl.formatMessage({
            id: 'window.maximize',
            defaultMessage: 'Maximize window',
          })}
        />

        <Button
          className="wcls"
          onClick={store.window.close}
          icon={faWindowClose}
          title={intl.formatMessage({
            id: 'window.close',
            defaultMessage: 'Close',
          })}
        />

        <Button
          className="pref"
          onClick={this.showPreferences}
          icon={faCog}
          title={intl.formatMessage({
            id: 'header.preferences',
            defaultMessage: 'Preferences',
          })}
        />

        <img className="cover" alt="Album cover" src={defaultAlbumCover} />

        <div className="title">
          {displayedTrack.title}
        </div>

        <div className="album">
          {displayedTrack.album}
        </div>

        <Seeker
          duration={displayedTrack.duration}
          position={position}
          onSeek={store.playback.seek}
        />
      </div>
    );
  }
}
