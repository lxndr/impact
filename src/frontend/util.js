export function formatDuration(secs) {
  if (!(secs && secs >= 0)) {
    secs = 0;
  }

  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor(secs / 60) % 60;
  const seconds = Math.round(secs % 60, 0);

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

export function defer() {
  let resolve;
  let reject;

  const promise = new Promise((...args) => {
    resolve = args[0];
    reject = args[1];
  });

  return {resolve, reject, promise};
}
