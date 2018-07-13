import _ from 'lodash';
import { promisify } from 'util';
import Datastore from 'nedb/lib/datastore';
import Cursor from 'nedb/lib/cursor';

const datastoreMethods = [
  'loadDatabase',
  'insert',
  'update',
  'remove',
  'ensureIndex',
];

_.each(datastoreMethods, (name) => {
  const fn = Datastore.prototype[name];
  Datastore.prototype[name] = promisify(fn);
});

Cursor.prototype.then = function then(resolve, reject) {
  this.exec((err, val) => {
    if (err) {
      reject(err);
      return this;
    }

    resolve(val);
    return this;
  });
};
