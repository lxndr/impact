import React from 'react';
import { injectIntl } from 'react-intl';

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

import {
  useBehaviorSubject,
  useRouter,
  backend,
  window,
} from '../../services';

import style from '../../style';
import defaultAlbumCover from '../../assets/album.svg';
import Button from './button';
import Seeker from './seeker';

/**
 * @typedef {import('react-intl').InjectedIntl} InjectedIntl
 * @typedef {import('common/types').Track} Track
 */

/** @param {?Track} track */
const getDisplayedTrack = (track) => {
  if (!track) {
    return null;
  }

  const artist = track.album.artist || 'Unknown artist';
  const album = track.album.title || 'Unknown album';

  return {
    title: track.title || 'Unknown title',
    album: `by ${artist} from ${album}`,
    duration: track.duration,
  };
};

/**
 * @param {object} props
 * @param {InjectedIntl} props.intl
 */
const Header = ({ intl }) => {
  const { history } = useRouter();
  const playingTrack = useBehaviorSubject(backend.playback.track$);
  const displayedTrack = getDisplayedTrack(playingTrack);
  const state = useBehaviorSubject(backend.playback.state$);

  const showPreferences = () => history.push('/preferences');

  const playing = state === 'playing';

  return (
    <div className={style('app-header')}>
      <Button
        className="prev"
        onClick={() => backend.playback.previous()}
        icon={faBackward}
        title={intl.formatMessage({
          id: 'playback.prev',
          defaultMessage: 'Previous track',
        })}
      />

      <Button
        className="play"
        onClick={() => backend.playback.toggle()}
        icon={playing ? faPause : faPlay}
        title={intl.formatMessage({
          id: playing ? 'playback.pause' : 'playback.play',
          defaultMessage: playing ? 'Puase' : 'Play',
        })}
      />

      <Button
        className="next"
        onClick={() => backend.playback.next()}
        icon={faForward}
        title={intl.formatMessage({
          id: 'playback.next',
          defaultMessage: 'Next track',
        })}
      />

      <Button
        className="wmin"
        onClick={window.minimize}
        icon={faWindowMinimize}
        title={intl.formatMessage({
          id: 'window.minimize',
          defaultMessage: 'Minimize window',
        })}
      />

      <Button
        className="wmax"
        onClick={window.toggle}
        icon={faWindowMaximize}
        title={intl.formatMessage({
          id: 'window.maximize',
          defaultMessage: 'Maximize window',
        })}
      />

      <Button
        className="wcls"
        onClick={window.close}
        icon={faWindowClose}
        title={intl.formatMessage({
          id: 'window.close',
          defaultMessage: 'Close',
        })}
      />

      <Button
        className="pref"
        onClick={showPreferences}
        icon={faCog}
        title={intl.formatMessage({
          id: 'header.preferences',
          defaultMessage: 'Preferences',
        })}
      />

      {displayedTrack && (
        <>
          <img className="cover" alt="Album cover" src={defaultAlbumCover} />

          <div className="title">
            {displayedTrack.title}
          </div>

          <div className="album">
            {displayedTrack.album}
          </div>

          <Seeker duration={displayedTrack.duration} />
        </>
      )}
    </div>
  );
};

export default injectIntl(Header);
