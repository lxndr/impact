import React from 'react';
import { FormattedMessage } from 'react-intl';
import { formatDate } from '../../utils';
import messages from '../../messages';
import AlbumDisc from './album-disc';

/**
 * @typedef {import('../../../common/types').Album} AlbumType
 * @typedef {import('../../../common/types').Track} Track
 */

/**
 * @param {AlbumType} album
 */
const formatPublisher = ({ publisher, catalogId }) => {
  let str = `by ${publisher}`;

  if (catalogId) {
    str += ` (${catalogId})`;
  }

  return str;
};

/**
 * @param {object} props
 * @param {?string} props.title
 */
const Title = ({ title }) => {
  if (title) {
    return <span className="title">{title}</span>;
  }

  return (
    <span className="title unknown">
      <FormattedMessage {...messages.library.unknownAlbum} />
    </span>
  );
};

/**
 * @param {object} props
 * @param {AlbumType} props.album
 * @param {?Track} props.playingTrack
 * @param {(track: Track) => void} props.onSelect
 */
const Album = ({ album, playingTrack = null, onSelect }) => (
  <div className="album">
    <div className="header">
      <div>
        <div className="title-edition">
          <Title title={album.title} />

          {album.edition
            && <span className="edition">{` (${album.edition})`}</span>}
        </div>
      </div>

      <div>
        {album.releaseDate && (
          <div className="release-date">{formatDate(album.releaseDate)}</div>
        )}
        {album.publisher && (
          <div className="publisher">{formatPublisher(album)}</div>
        )}
      </div>
    </div>

    {album.discs.map((disc) => {
      const showTitle = Boolean(disc.title || album.discs.length > 1);

      return (
        <AlbumDisc
          key={disc._id}
          disc={disc}
          showTitle={showTitle}
          playingTrack={playingTrack}
          onSelect={onSelect}
        />
      );
    })}
  </div>
);

export default React.memo(Album);
