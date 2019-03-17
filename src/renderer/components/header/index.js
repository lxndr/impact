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

import { backend, window } from '../../services';
import { useRouter, useBehaviorSubject } from '../../utils';
import defaultAlbumImage from '../../assets/album.svg';
import style from '../../style';
import messages from '../../messages';
import Button from './button';
import Seeker from './seeker';

/**
 * @typedef {import('react-intl').InjectedIntl} InjectedIntl
 * @typedef {import('common/types').Track} Track
 */

/**
 * @param {?Track} track
 * @param {InjectedIntl} intl
 */
const formatDisplayedInfo = (track, intl) => {
  if (!track) {
    return {
      title: '',
      album: '',
      image: defaultAlbumImage,
    };
  }

  const title = track.title || intl.formatMessage(messages.library.unknownTrack);
  const artist = track.album.artist || intl.formatMessage(messages.library.unknownArtist);
  const album = track.album.title || intl.formatMessage(messages.library.unknownAlbum);

  return {
    title,
    album: intl.formatMessage(messages.playback.fromAlbum, { artist, album }),
    image: track.images.length ? track.images[0].path : defaultAlbumImage,
  };
};

/**
 * @param {object} props
 * @param {InjectedIntl} props.intl
 */
const Header = ({ intl }) => {
  const { history } = useRouter();
  const track = useBehaviorSubject(backend.playback.track$);
  const state = useBehaviorSubject(backend.playback.state$);
  const displayedInfo = formatDisplayedInfo(track, intl);
  const showPreferences = () => history.push('/preferences');
  const playing = state === 'playing';

  return (
    <div className={style('app-header')}>
      <Button
        className="prev"
        disabled={!track}
        onClick={() => backend.playback.previous()}
        icon={faBackward}
        title={intl.formatMessage(messages.playback.prev)}
      />

      <Button
        className="play"
        disabled={!track}
        onClick={() => backend.playback.toggle()}
        icon={playing ? faPause : faPlay}
        title={intl.formatMessage(playing
          ? messages.playback.pause
          : messages.playback.play)}
      />

      <Button
        className="next"
        disabled={!track}
        onClick={() => backend.playback.next()}
        icon={faForward}
        title={intl.formatMessage(messages.playback.next)}
      />

      <Button
        className="wmin"
        onClick={window.minimize}
        icon={faWindowMinimize}
        title={intl.formatMessage(messages.window.minimize)}
      />

      <Button
        className="wmax"
        onClick={window.toggle}
        icon={faWindowMaximize}
        title={intl.formatMessage(messages.window.maximize)}
      />

      <Button
        className="wcls"
        onClick={window.close}
        icon={faWindowClose}
        title={intl.formatMessage(messages.window.close)}
      />

      <Button
        className="pref"
        onClick={showPreferences}
        icon={faCog}
        title={intl.formatMessage(messages.window.preferences)}
      />

      <img className="cover" alt="Album cover" src={displayedInfo.image} />
      <div className="title">{displayedInfo.title}</div>
      <div className="album">{displayedInfo.album}</div>
      <Seeker duration={track ? track.duration : 0} />
    </div>
  );
};

export default injectIntl(Header);
