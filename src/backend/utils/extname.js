import path from 'path';

/**
 * @param {String} fname
 * @returns {?string}
 */
export default function extname(fname) {
  const ext = path.extname(fname);

  if (ext.length > 1) {
    return ext.substr(1).toLowerCase();
  }

  return null;
}
