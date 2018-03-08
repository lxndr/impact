export function formatDuration(secs) {
  if (!(secs && secs >= 0)) {
    secs = 0;
  }

  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor(secs / 60) % 60;
  const seconds = secs % 60;

  let ret = '';

  if (hours) {
    ret += hours + ':';
    ret += minutes.toString().padStart(2, '0');
  } else {
    ret += minutes;
  }

  ret += ':' + seconds.toString().padStart(2, '0');

  return ret;
}
