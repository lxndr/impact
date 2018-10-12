import os from 'os';
import MPV from '@lxndr/mpv';

function mpvExecutable() {
  switch (os.platform()) {
    case 'win32':
      return 'node_modules/@lxndr/mpv/bin/win32/mpv.exe';
    default:
      return 'mpv';
  }
}

const mpv = new MPV({ exec: mpvExecutable() });

export default mpv;
