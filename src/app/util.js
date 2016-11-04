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

export const fs = promisifySome('fs-extra', ['readFile', 'access', 'readdir', 'rename', 'stat', 'remove', 'emptyDir', 'ensureDir']);

let _gst = null;

try {
  _gst = require('../../build/Debug/gst.node');
} catch (err) {
  _gst = require('../../build/Release/gst.node');
}

export const gst = promisifySome(_gst, ['metadata']);
