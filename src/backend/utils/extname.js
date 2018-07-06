import path from 'path';

export function extname(fname) {
  const ext = path.extname(fname);

  if (ext.length > 1) {
    return ext.substr(1).toLowerCase();
  }

  return null;
}
