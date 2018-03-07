import path from 'path';
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

export function extname(fname) {
  const ext = path.extname(fname);

  if (ext.length > 1) {
    return ext.substr(1).toLowerCase();
  }

  return null;
}
