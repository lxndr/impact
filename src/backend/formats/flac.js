/* eslint-disable no-bitwise */
import fs from 'fs-extra';
import readVorbisComment from './vorbis';
import BufferReader from '../utils/buffer-reader';

/**
 * @typedef {import('../types').FileHandler} FileHandler
 * @typedef {import('../types').Image} Image
 */

/** @enum {number} */
const BlockType = {
  STREAM_INFO: 0,
  VORBIS_COMMENT: 4,
  PICTURE: 6,
};

const SIGNATURE_SIZE = 4;
const BLOCK_HEADER_SIZE = 4;

/**
 * @param {number} fd
 * @param {number} offset
 * @returns {Promise<Object>}
 */
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

/**
 * @param {number} fd
 */
async function readSignature(fd) {
  const buf = Buffer.alloc(SIGNATURE_SIZE);
  await fs.read(fd, buf, 0, SIGNATURE_SIZE, 0);

  const signature = buf.toString('ascii');

  if (signature !== 'fLaC') {
    throw new Error('Not a FLAC file');
  }
}

/**
 * @param {Buffer} buf
 */
function readStreamInfo(buf) {
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

/**
 * @param {Buffer} buf
 * @returns {Image}
 */
function readImage(buf) {
  const br = new BufferReader(buf);
  const type = br.uint32();
  const mimeType = br.lstring(br.uint32());
  br.skip(br.uint32());
  br.skip(4 * 4);
  const blob = br.blob(br.uint32());

  return {
    type,
    mimeType,
    blob,
  };
}

/**
 * @param {number} fd
 */
export async function read(fd) {
  let offset = SIGNATURE_SIZE;
  let streamInfo;
  let tags = {};
  const images = [];

  await readSignature(fd);

  for (;;) {
    const block = await readBlock(fd, offset);

    switch (block.type) {
      case BlockType.STREAM_INFO:
        streamInfo = readStreamInfo(block.buf);
        break;
      case BlockType.VORBIS_COMMENT:
        tags = readVorbisComment(block.buf);
        break;
      case BlockType.PICTURE:
        images.push(readImage(block.buf));
        break;
      default:
        break;
    }

    if (block.last) {
      break;
    }

    offset += block.length + BLOCK_HEADER_SIZE;
  }

  if (!streamInfo) {
    throw new Error('Could not find stream info block.');
  }

  return {
    sampleRate: streamInfo.sampleRate,
    nChannels: streamInfo.nChannels,
    duration: Math.ceil(streamInfo.totalSamples / streamInfo.sampleRate),
    images,
    tags,
  };
}

/** @type FileHandler */
export default async function flacHandler({ file }) {
  const fd = await fs.open(file.path, 'r');
  const info = await read(fd);
  const { tags, images } = info;
  await fs.close(fd);

  return [{
    artist: tags.albumArtist,
    title: tags.album,
    releaseDate: tags.releaseDate,
    releaseType: tags.releaseType,
    discTitle: tags.discTitle,
    discNumber: tags.discNumber,
    tracks: [{
      title: tags.title,
      artists: [tags.albumArtist],
      genre: tags.genre,
      number: tags.number,
      images,
      sampleRate: info.sampleRate,
      nChannels: info.nChannels,
      offset: 0,
      duration: info.duration,
      file,
    }],
  }];
}
