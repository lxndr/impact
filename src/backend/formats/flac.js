/* eslint-disable no-bitwise */
import _ from 'lodash';
import fs from 'fs-extra';
import promiseAll from 'p-map';
import readVorbisComment from './vorbis';
import BufferReader from '../utils/buffer-reader';

/**
 * @typedef {import('common/types').FileHandler} FileHandler
 * @typedef {import('common/types').InspectImage} InspectImage
 * @typedef {import('./vorbis').VorbisTags} VorbisTags
 */

/** @enum {number} */
const BlockType = {
  STREAM_INFO: 0,
  VORBIS_COMMENT: 4,
  PICTURE: 6,
};

/**
 * @typedef {object} Block
 * @prop {BlockType} type
 * @prop {number} offset
 * @prop {number} length
 * @prop {boolean} last
 */

const SIGNATURE_SIZE = 4;
const BLOCK_HEADER_SIZE = 4;

/**
 * @param {string} [type]
 * @returns {string}
 */
function normalizeReleaseType(type) {
  switch (type) {
    default:
      return 'album';
  }
}

/**
 * @param {number} fd
 * @param {number} offset
 * @returns {Promise<Block>}
 */
async function readBlock(fd, offset) {
  const buf = Buffer.alloc(BLOCK_HEADER_SIZE);
  await fs.read(fd, buf, 0, BLOCK_HEADER_SIZE, offset);

  const last = Boolean(buf.readUInt8(0) >> 7);
  const type = buf.readUInt8(0) & 0x7f;
  const length = buf.readUInt32BE(0) & 0xffffff;

  if (length <= 0) {
    throw new Error('Block is empty');
  }

  return {
    type,
    offset,
    length,
    last,
  };
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
    hash: buf.slice(18, 18 + 16).toString('hex'),
  };
}

/**
 * @param {Buffer} buf
 * @returns {InspectImage}
 */
function readImage(buf) {
  const br = new BufferReader(buf);
  br.skip(4); /* type */
  const mimeType = br.lstring(br.uint32());
  br.skip(br.uint32());
  br.skip(4 * 4);
  const blob = br.blob(br.uint32());

  return {
    mimeType,
    blob,
  };
}

/**
 * @param {number} fd
 */
async function readBlocks(fd) {
  /** @type {Block[]} */
  const blocks = [];
  let offset = SIGNATURE_SIZE;

  for (;;) {
    const block = await readBlock(fd, offset);
    blocks.push(block);

    if (block.last) {
      break;
    }

    offset += block.length + BLOCK_HEADER_SIZE;
  }

  return blocks;
}

/**
 * @param {number} fd
 * @param {Block} block
 */
async function readBlockData(fd, block) {
  const buf = Buffer.alloc(block.length);
  await fs.read(fd, buf, 0, block.length, block.offset + BLOCK_HEADER_SIZE);
  return buf;
}

/**
 * @param {number} fd
 */
export async function read(fd) {
  await readSignature(fd);
  const blocks = await readBlocks(fd);

  /* stream info */
  const streamInfoBlock = _.find(blocks, { type: BlockType.STREAM_INFO });

  if (!streamInfoBlock) {
    throw new Error('Could not find stream info block.');
  }

  const streamInfoBuffer = await readBlockData(fd, streamInfoBlock);
  const streamInfo = readStreamInfo(streamInfoBuffer);

  /* vorbis comment */
  const vorbisCommentBlocks = _.filter(blocks, { type: BlockType.VORBIS_COMMENT });
  const tagList = await promiseAll(vorbisCommentBlocks, async (block) => {
    const buf = await readBlockData(fd, block);
    return readVorbisComment(buf);
  });

  /** @type {VorbisTags} */
  const tags = _.assign({}, ...tagList);

  /* pictures */
  const pictureBlocks = _.filter(blocks, { type: BlockType.PICTURE });
  const images = await promiseAll(pictureBlocks, async (block) => {
    const buf = await readBlockData(fd, block);
    return readImage(buf);
  });

  return {
    sampleRate: streamInfo.sampleRate,
    nChannels: streamInfo.nChannels,
    duration: Math.ceil(streamInfo.totalSamples / streamInfo.sampleRate),
    hash: streamInfo.hash,
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

  /** @type {string[]} */
  const artists = _.uniq(
    [tags.albumArtist]
      .concat(tags.artists, tags.artist)
      .filter(Boolean),
  );

  return [{
    artist: artists[0],
    title: tags.album,
    releaseDate: tags.releaseDate,
    releaseType: normalizeReleaseType(tags.releaseType),
    discTitle: tags.discTitle,
    discNumber: tags.discNumber,
    publisher: tags.label,
    catalogId: tags.catalogNumber,
    tracks: [{
      title: tags.title,
      artists,
      genre: tags.genre,
      number: tags.number,
      images,
      sampleRate: info.sampleRate,
      nChannels: info.nChannels,
      duration: info.duration,
      file: {
        ...file,
        hash: info.hash,
      },
    }],
  }];
}
