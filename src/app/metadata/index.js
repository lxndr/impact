import path from 'path';
import {fs} from '../util';
import * as flac from './flac';
import * as cue from './cue';

export {cue};

const extmap = {
  '.flac': flac.read
};

export async function read(fname) {
  const ext = path.extname(fname).toLowerCase();

  const readFn = extmap[ext];

  if (!readFn) {
    throw new Error('Format not supported');
  }

  const fd = await fs.open(fname, 'r');
  const info = await readFn(fd);
  await fs.close(fd);
  return info;
}
