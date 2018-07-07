const tagMap = {
  title: 'title',
  date: 'releaseDate',
  albumartistsort: 'albumArtistSort',
  originaldate: 'originalDate',
  albumartist: 'albumArtist',
  album: 'album',
  releasetype: 'releaseType',
  artist: 'artist',
  musicbrainz_releasegroupid: 'musicBrainz_releaseGroupId', // eslint-disable-line camelcase
  artistsort: 'artistSort',
  artists: 'artists',
  genre: 'genre',
  tracknumber: 'number',
  discnumber: 'discNumber',
  discsubtitle: 'discTitle',
};

const tagArray = [
  'artists',
];

export default function readVorbisComment(fd, buf) {
  const vendorLength = buf.readUInt32LE(0);
  let offset = vendorLength + 4;
  const nTags = buf.readUInt32LE(offset);
  offset += 4;

  const tags = {};

  for (let i = 0; i < nTags; i++) {
    const length = buf.readUInt32LE(offset);
    offset += 4;

    const comment = buf.toString('utf8', offset, offset + length);
    offset += length;

    const [_key, val] = comment.split('=', 2);
    let key = _key.toLowerCase();

    if (key in tagMap) {
      key = tagMap[key];

      if (tagArray.includes(key)) {
        let arr = tags[key];
        if (!arr) {
          arr = tags[key] = [];
        }
        arr.push(val);
      } else {
        tags[key] = val;
      }
    }
  }

  if (tags.number) {
    tags.number = parseInt(tags.number, 10);
  }

  if (tags.discNumber) {
    tags.discNumber = parseInt(tags.discNumber, 10);
  }

  return tags;
}
