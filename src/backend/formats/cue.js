import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';

function parseTime(str) {
  const a = str.split(':');

  const minutes = parseInt(a[0], 10);
  const seconds = parseInt(a[1], 10);
  const frames = parseInt(a[2], 10);

  return (minutes * 60) + seconds + (frames / 75);
}

export function parse(str) {
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
        .flatMap((v, i) =>
          (i % 2 ? v : v.split(' ')))
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
        default:
          console.warn(`Unknown CUE command '${line}'`);
      }
    });

  return cue;
}

export default async function ({ file, scanner }) {
  const str = await fs.readFile(file, 'utf8');
  const info = parse(str);

  const date = _.chain(info.remarks).find({ key: 'DATE' }).get('value').value();
  const genre = _.chain(info.remarks).find({ key: 'GENRE' }).get('value').value();

  const album = {
    artist: info.performer || null,
    title: info.title,
    date,
  };

  const files = await Promise.all(info.files.map(async (f) => {
    const mediaPath = path.resolve(path.dirname(file), f.name);
    const mediaInfo = await scanner.inspect(mediaPath);
    let { duration: totalDuration } = mediaInfo.data.track;

    return {
      path: mediaPath,
      tracks: f.tracks.slice().reverse().map((track) => {
        const offset = _(track.indexes).sortBy('index').last().time;
        const duration = totalDuration - offset;
        totalDuration = offset;

        return {
          number: track.number,
          title: track.title,
          artists: [track.performer],
          genre,
          offset,
          duration,
        };
      }).reverse(),
    };
  }));

  return { type: 'index', data: { album, files } };
}