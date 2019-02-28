/* eslint-disable no-bitwise */

import fs from 'fs-extra';
import { BufferReader } from '../utils';

/** @typedef {import('common/types').FileHandler} FileHandler */

const HEADER_SIZE = 32;

const RATES = [6000, 8000, 9600, 11025, 12000, 16000, 22050,
  24000, 32000, 44100, 48000, 64000, 88200, 96000, 192000];

/**
 * @param {number} fd
 */
async function readHeader(fd) {
  const buf = Buffer.alloc(HEADER_SIZE);
  await fs.read(fd, buf, 0, HEADER_SIZE, 0);
  const br = new BufferReader(buf, false);

  const signature = br.lstring(4, 'ascii');

  if (signature !== 'wvpk') {
    throw new Error('Not a wavpack file.');
  }

  const header = {
    size: br.uint32(),
    version: br.uint16(),
    blockIndexU8: br.uint8(),
    totalSamplesU8: br.uint8(),
    totalSamples: br.uint32(),
    blockIndex: br.uint32(),
    blockSamples: br.uint32(),
    flags: br.uint32(),
    crc: br.uint32(),
  };

  return header;
}

/**
 * @param {number} fd
 */
async function read(fd) {
  const header = await readHeader(fd);
  const sampleRate = RATES[(header.flags >> 23) & 0xf];
  const nChannels = header.flags & 0x4;

  if (!(header.totalSamples > 1 && header.blockIndex === 0)) {
    throw new Error('wv.header.totalSamplesU8 not supported');
  }

  const duration = header.totalSamples / sampleRate;

  return {
    duration,
    nChannels,
    sampleRate,
    hash: header.crc.toString(16),
  };
}

/** @type FileHandler */
export default async function wavpackHandler({ file }) {
  const fd = await fs.open(file.path, 'r');
  const info = await read(fd);
  await fs.close(fd);

  return [{
    tracks: [{
      duration: info.duration,
      nChannels: info.nChannels,
      sampleRate: info.sampleRate,
      file: {
        ...file,
        hash: info.hash,
      },
    }],
  }];
}
