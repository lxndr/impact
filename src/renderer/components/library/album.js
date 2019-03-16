import React from 'react';
import { FormattedMessage } from 'react-intl';
import { formatDate } from '../../utils';
import messages from '../../messages';
import defaultAlbumImage from '../../assets/album.svg';
import AlbumDisc from './album-disc';

/**
 * @typedef {import('common/types').Track} Track
 * @typedef {import('common/types').Disc} Disc
 * @typedef {import('common/types').Album} AlbumType
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
const Album = ({ album, playingTrack = null, onSelect }) => {
  /** @type {?string} */
  let lastImage = null;

  /** @param {Disc} disc */
  const getDiscImage = (disc) => {
    const albumImage = disc.images.length ? disc.images[0].path : null;

    if (albumImage === lastImage) {
      return lastImage ? null : defaultAlbumImage;
    }

    lastImage = albumImage;
    return albumImage;
  };

  return (
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
        const image = getDiscImage(disc);

        return (
          <AlbumDisc
            key={disc._id}
            disc={disc}
            showTitle={showTitle}
            image={image}
            playingTrack={playingTrack}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
};

export default React.memo(Album);
