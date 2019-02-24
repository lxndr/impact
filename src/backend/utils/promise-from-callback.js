/**
 * @template T
 * @param {(cb: (err: Error, val?: T) => void) => void} cb
 * @returns {Promise<T>}
 */
export default function promiseFromCallback(cb) {
  return new Promise((resolve, reject) => {
    cb((err, val) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(val);
    });
  });
}
