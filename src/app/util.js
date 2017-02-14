import _ from 'lodash';
import {promisify} from 'bluebird';

function promisifySome(module, funcs) {
  if (typeof module === 'string') {
    module = require(module);
  }

  if (funcs) {
    return _.transform(funcs, (results, func) => {
      results[func] = promisify(module[func]);
    }, {});
  }

  return promisify(module);
}

export const fs = promisifySome('fs-extra', [
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
