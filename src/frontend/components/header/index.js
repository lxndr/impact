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

import { store } from '../../store';
import { Button } from './button';
import { Seeker } from './seeker';
import { historyShape } from '../../utils';
import defaultAlbumCover from '../../assets/album.svg';

@withRouter
@injectIntl
@observer
export class Header extends React.Component {
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
      position = state.position;
    }

    return (
      <div className="header">
        <Button
          className="prev"
          onClick={store.playback.prev}
          icon={faBackward}
          title={intl.formatMessage({
            id: 'header.prev',
            defaultMessage: 'Previous track',
          })}
        />

        <Button
          className="play"
          onClick={store.playback.toggle}
          icon={playing ? faPause : faPlay}
          title={intl.formatMessage({
            id: playing ? 'header.pause' : 'header.play',
            defaultMessage: playing ? 'Puase' : 'Play',
          })}
        />

        <Button
          className="next"
          onClick={store.playback.next}
          icon={faForward}
          title={intl.formatMessage({
            id: 'header.next',
            defaultMessage: 'Next track',
          })}
        />

        <Button
          className="wmin"
          onClick={store.minimize}
          icon={faWindowMinimize}
          title={intl.formatMessage({
            id: 'header.minimizeWindow',
            defaultMessage: 'Minimize window',
          })}
        />

        <Button
          className="wmax"
          onClick={store.maximize}
          icon={faWindowMaximize}
          title={intl.formatMessage({
            id: 'header.maximizeWindow',
            defaultMessage: 'Maximize window',
          })}
        />

        <Button
          className="wcls"
          onClick={store.close}
          icon={faWindowClose}
          title={intl.formatMessage({
            id: 'header.closeWindow',
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
