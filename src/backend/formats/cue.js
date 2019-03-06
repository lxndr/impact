import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';
import globby from 'globby';

/**
 * @typedef {import('common/types').InspectAlbum} InspectAlbum
 * @typedef {import('common/types').FileHandler} FileHandler
 */

/**
 * @typedef {Object} CueRemark
 * @property {string} key
 * @property {string} value
 */

/**
 * @typedef {Object} CueIndex
 * @property {number} index
 * @property {number} time
 */

/**
 * @typedef {Object} CueTrack
 * @property {number} number
 * @property {string} type
 * @property {Array<CueIndex>} indexes
 * @property {string} [title]
 * @property {string} [performer]
 */

/**
 * @typedef {Object} CueFile
 * @property {string} name
 * @property {string} type
 * @property {Array<CueTrack>} tracks
 */

/**
 * @typedef {Object} Cue
 * @property {string} [performer]
 * @property {string} [title]
 * @property {string} [catalog]
 * @property {CueRemark[]} remarks
 * @property {CueFile[]} files
 */

/**
 * @param {string} str
 * @return {number}
 */
function parseTime(str) {
  const a = str.split(':');

  const minutes = parseInt(a[0], 10);
  const seconds = parseInt(a[1], 10);
  const frames = parseInt(a[2], 10);

  return (minutes * 60) + seconds + (frames / 75);
}

/**
 * @param {CueRemark[]} remarks
 * @param {string} key
 */
function fetchRemarkValue(remarks, key) {
  const remark = remarks.find(remark => remark.key === key);
  return remark ? remark.value : undefined;
}

/**
 * @param {string} str
 * @return {Cue}
 */
export function parse(str) {
  /** @type Cue */
  const cue = {
    remarks: [],
    files: [],
  };

  let currentFile = null;
  let currentTrack = null;

  str
    .split(/\r?\n/)
    .forEach((line) => {
      const args = _(line)
        .split('"')
        .flatMap((v, i) => (i % 2 ? v : v.split(' ')))
        .filter(Boolean)
        .value();

      if (args.length < 1) {
        return;
      }

      const [command, arg1, arg2] = args;

      switch (command) {
        case 'REM':
          cue.remarks.push({
            key: arg1.toUpperCase(),
            value: arg2,
          });
          break;
        case 'PERFORMER':
          if (currentTrack) {
            currentTrack.performer = arg1;
          } else {
            cue.performer = arg1;
          }
          break;
        case 'TITLE':
          if (currentTrack) {
            currentTrack.title = arg1;
          } else {
            cue.title = arg1;
          }
          break;
        case 'FILE':
          currentFile = {
            name: arg1,
            type: arg2.toUpperCase(),
            tracks: [],
          };
          cue.files.push(currentFile);
          break;
        case 'TRACK':
          currentTrack = {
            number: parseInt(arg1, 10),
            type: arg2,
            indexes: [],
          };
          currentFile.tracks.push(currentTrack);
          break;
        case 'INDEX':
          currentTrack.indexes.push({
            index: parseInt(arg1, 10),
            time: parseTime(arg2),
          });
          break;
        case 'ISRC':
          if (currentTrack) {
            currentTrack.isrc = arg1;
          }
          break;
        case 'CATALOG':
          cue.catalog = arg1;
          break;
        case 'FLAGS':
          break;
        default:
          console.warn(`Unknown CUE command '${line}'`);
      }
    });

  return cue;
}

/** @type FileHandler */
export default async function cueHandler({ file, scanner }) {
  const dir = path.dirname(file.path);
  const str = await fs.readFile(file.path, 'utf8');
  const info = parse(str);

  const originalDate = fetchRemarkValue(info.remarks, 'DATE');
  const releaseDate = fetchRemarkValue(info.remarks, 'RELEASEDATE');
  const genre = fetchRemarkValue(info.remarks, 'GENRE');
  const edition = fetchRemarkValue(info.remarks, 'EDITION');
  const publisher = fetchRemarkValue(info.remarks, 'PUBLISHER');
  const catalogId = fetchRemarkValue(info.remarks, 'CATALOGID');
  const discNumber = fetchRemarkValue(info.remarks, 'DISCNUMBER');
  const discTitle = fetchRemarkValue(info.remarks, 'DISCTITLE');

  /** @type {InspectAlbum} */
  const album = {
    artist: info.performer,
    title: info.title,
    discNumber: Number(discNumber) || undefined,
    discTitle,
    originalDate,
    releaseDate,
    edition,
    publisher,
    catalogId,
    tracks: [],
  };

  try {
    const matchNames = '{cover,front,folder}.{jpg,jpeg,png,gif}';

    const images = await globby([
      matchNames,
      `artwork/${matchNames}`,
      `../${matchNames}`,
      `../artwork/${matchNames}`,
    ], {
      cwd: dir,
      nocase: true,
      onlyFiles: true,
    });

    if (images.length) {
      album.images = [{
        path: path.join(dir, images[0]),
      }];
    }
  } catch (err) {
    console.warn(err);
  }

  for (const f of info.files) {
    const mediaPath = path.resolve(dir, f.name);
    const mediaInfo = await scanner.inspect(mediaPath);
    const mediaTrack = _.get(mediaInfo, '[0].tracks[0]');

    if (!mediaTrack) {
      throw new Error(`Cue file "${file.path}" has FILE field "${mediaPath}" which is not a media file.`);
    }

    let totalDuration = mediaTrack.duration;

    const tracks = f.tracks
      .slice()
      .reverse()
      .map((track) => {
        const indexes = _.sortBy(track.indexes, 'index');
        const offset = indexes.length ? indexes[0].time : 0;
        const duration = totalDuration - offset;
        totalDuration = offset;

        return {
          number: track.number,
          title: track.title,
          artists: [track.performer],
          genre,
          offset,
          duration,
          index: {
            ...file,
            type: 'index',
          },
          file: mediaTrack.file,
          images: mediaTrack.images,
          nChannels: mediaTrack.nChannels,
          sampleRate: mediaTrack.sampleRate,
        };
      })
      .reverse();

    album.tracks.push(...tracks);
  }

  return [album];
}
