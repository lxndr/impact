/* eslint-disable no-bitwise */

import fs from 'fs-extra';
import readVorbisComment from './vorbis';

const STREAM_INFO_TYPE = 0;
const VORBIS_COMMENT_TYPE = 4;

const SIGNATURE_SIZE = 4;
const BLOCK_HEADER_SIZE = 4;

async function readBlock(fd, offset) {
  const buf = Buffer.alloc(BLOCK_HEADER_SIZE);
  await fs.read(fd, buf, 0, BLOCK_HEADER_SIZE, offset);

  const block = {
    last: buf.readUInt8(0) >> 7,
    type: buf.readUInt8(0) & 0x7f,
    length: buf.readUInt32BE(0) & 0xffffff,
  };

  if (block.length <= 0) {
    throw new Error('Block is empty');
  }

  block.buf = Buffer.alloc(block.length);
  await fs.read(fd, block.buf, 0, block.length, offset + BLOCK_HEADER_SIZE);

  return block;
}

async function readSignature(fd) {
  const buf = Buffer.alloc(SIGNATURE_SIZE);
  await fs.read(fd, buf, 0, SIGNATURE_SIZE, 0);

  const signature = buf.toString('ascii');

  if (signature !== 'fLaC') {
    throw new Error('Not a FLAC file');
  }
}

async function readStreamInfo(fd, buf) {
  if (buf.length < 34) {
    throw new Error('Not a FLAC file');
  }

  return {
    sampleRate: buf.readUInt32BE(10) >> 12,
    nChannels: ((buf.readUInt8(12) & 0xe) >> 1) + 1,
    bitsPerSample: ((buf.readUInt16BE(12) & 0x1f0) >> 4) + 1,
    totalSamples: buf.readUInt32BE(14), /* FIXME: has to be 36 bits */
  };
}

export async function read(fd) {
  let offset = SIGNATURE_SIZE;
  let streamInfo;
  let tags;

  await readSignature(fd);

  for (;;) {
    const block = await readBlock(fd, offset);

    switch (block.type) {
      case STREAM_INFO_TYPE:
        streamInfo = await readStreamInfo(fd, block.buf);
        break;
      case VORBIS_COMMENT_TYPE:
        tags = await readVorbisComment(fd, block.buf);
        break;
      default:
        break;
    }

    if (block.last) {
      break;
    }

    offset += block.length + BLOCK_HEADER_SIZE;
  }

  return {
    sampleRate: streamInfo.sampleRate,
    nChannels: streamInfo.nChannels,
    bitsPerSample: streamInfo.bitsPerSample,
    duration: Math.ceil(streamInfo.totalSamples / streamInfo.sampleRate),
    ...tags,
  };
}

export default async function ({ filename }) {
  const fd = await fs.open(filename, 'r');
  const info = await read(fd);
  await fs.close(fd);

  return {
    type: 'media',
    albums: [{
      artist: info.albumArtist,
      title: info.album,
      releaseDate: info.releaseDate,
      releaseType: info.releaseType,
      discTitle: info.discTitle,
      discNumber: info.discNumber,
      tracks: [{
        title: info.title,
        genre: info.genre,
        number: info.number,
        duration: info.duration,
      }],
    }],
  };
}
