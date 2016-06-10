import _ from 'lodash';
import {promisify} from 'bluebird';

function promisifySome(module, funcs) {
  const mod = require(module);

  if (funcs) {
    return _.transform(funcs, (results, func) => {
      results[func] = promisify(mod[func]);
    }, {});
  }

  return promisify(mod);
}

export const fs = promisifySome('fs-extra', ['readFile', 'access', 'readdir', 'rename', 'stat', 'remove', 'emptyDir', 'ensureDir']);
export const mm = promisifySome('musicmetadata');
