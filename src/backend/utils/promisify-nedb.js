import _ from 'lodash';
import { promisify } from 'util';
import Datastore from 'nedb/lib/datastore';
import Cursor from 'nedb/lib/cursor';

const datastoreMethods = [
  'loadDatabase',
  'insert',
  'remove',
  'ensureIndex',
];

_.each(datastoreMethods, (name) => {
  const fn = Datastore.prototype[name];
  Datastore.prototype[name] = promisify(fn);
});

const originalUpdate = Datastore.prototype.update;

Datastore.prototype.update = function update(query, update, options = {}, cb) {
  if (cb) {
    return originalUpdate(query, update, options, cb);
  }

  return new Promise((resolve, reject) => {
    const cb = (err, count, documents, upsert) => {
      if (err) {
        reject(err);
        return;
      }

      resolve([count, documents, upsert]);
    };

    Reflect.apply(originalUpdate, this, [query, update, options, cb]);
  });
};

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
