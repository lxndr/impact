/* eslint-disable no-bitwise */

import fs from 'fs-extra';

const HEADER_SIZE = 32;

const RATES = [6000, 8000, 9600, 11025, 12000, 16000, 22050,
  24000, 32000, 44100, 48000, 64000, 88200, 96000, 192000];

async function readHeader(fd) {
  const buf = Buffer.alloc(HEADER_SIZE);
  await fs.read(fd, buf, 0, HEADER_SIZE, 0);

  const signature = buf.toString('ascii', 0, 4);

  if (signature !== 'wvpk') {
    throw new Error('Not a wavpack file.');
  }

  const header = {
    // size: buf.readUInt32LE(4),
    // version: buf.readUInt16LE(8),
    // blockIndexU8: buf.readUInt8(10),
    totalSamplesU8: buf.readUInt8(11),
    totalSamples: buf.readUInt32LE(12),
    blockIndex: buf.readUInt32LE(16),
    // blockSamples: buf.readUInt32LE(20),
    flags: buf.readUInt32LE(24),
    // crc: buf.readUInt32LE(28),
  };

  return header;
}

export async function read(fd) {
  const header = await readHeader(fd);
  const sampleRate = RATES[(header.flags >> 23) & 0xf];

  if (!(header.totalSamples > 1 && header.blockIndex === 0)) {
    throw new Error('wv.header.totalSamplesU8 not supported');
  }

  const duration = header.totalSamples / sampleRate;

  return {
    duration,
  };
}

export default async function ({ filename }) {
  const fd = await fs.open(filename, 'r');
  const info = await read(fd);
  await fs.close(fd);

  const album = {
  };

  const track = {
    duration: info.duration,
  };

  return { type: 'media', album, track };
}
