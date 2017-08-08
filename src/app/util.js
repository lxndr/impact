import promisifyAll from 'thenify-all';

export const fs = promisifyAll(require('fs-extra'), [
  'open',
  'close',
  'read',
  'readFile',
  'access',
  'readdir',
  'rename',
  'stat',
  'remove',
  'emptyDir',
  'ensureDir'
]);
