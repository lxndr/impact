import _ from 'lodash';

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
    files: []
  };

  let currentFile = null;
  let currentTrack = null;

  str
    .split(/\r?\n/)
    .forEach(line => {
      const args = _(line)
        .split('"')
        .flatMap((v, i) =>
          i % 2 ? v : v.split(' ')
        )
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
            value: arg2
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
            tracks: []
          };
          cue.files.push(currentFile);
          break;
        case 'TRACK':
          currentTrack = {
            number: parseInt(arg1, 10),
            type: arg2,
            indexes: []
          };
          currentFile.tracks.push(currentTrack);
          break;
        case 'INDEX':
          currentTrack.indexes.push({
            index: parseInt(arg1, 10),
            time: parseTime(arg2)
          });
          break;
        default:
          console.warn(`Unknown CUE command '${line}'`);
      }
    });

  return cue;
}
