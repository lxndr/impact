import { BufferReader } from '../utils';

/**
 * @typedef {object} VorbisTags
 * @property {?string} title
 * @property {?string} releaseDate
 * @property {?string} originalDate
 * @property {?string} albumArtist
 * @property {?string} album
 * @property {?string} releaseType
 * @property {?string} musicBrainzReleaseGroupId
 * @property {?string[]} artist
 * @property {?string[]} artists
 * @property {?string} genre
 * @property {?number} number
 * @property {?number} discNumber
 * @property {?string} discTitle
 */

const tagMap = {
  title: 'title',
  date: 'releaseDate',
  originaldate: 'originalDate',
  albumartist: 'albumArtist',
  album: 'album',
  releasetype: 'releaseType',
  artist: 'artist',
  musicbrainz_releasegroupid: 'musicBrainz_releaseGroupId', // eslint-disable-line camelcase
  artists: 'artists',
  genre: 'genre',
  tracknumber: 'number',
  discnumber: 'discNumber',
  discsubtitle: 'discTitle',
};

const tagArray = [
  'artist',
  'artists',
];

/**
 * @param {Buffer} buf
 * @returns {VorbisTags}
 */
export default function readVorbisComment(buf) {
  const br = new BufferReader(buf, false);
  br.skip(br.uint32());
  const nTags = br.uint32();

  /** @type {VorbisTags} */
  const tags = {};

  for (let i = 0; i < nTags; i++) {
    const comment = br.lstring(br.uint32());
    const [_key, val] = comment.split('=', 2);
    let key = _key.toLowerCase();

    if (key in tagMap) { /* we only need the tags in the map */
      key = tagMap[key];

      if (tagArray.includes(key)) {
        let arr = tags[key];
        if (!arr) {
          arr = [];
          tags[key] = arr;
        }
        arr.push(val);
      } else {
        tags[key] = val;
      }
    }
  }

  if (tags.number) {
    tags.number = Number(tags.number);
  }

  if (tags.discNumber) {
    tags.discNumber = Number(tags.discNumber);
  }

  return tags;
}
