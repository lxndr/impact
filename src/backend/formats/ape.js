import fs from 'fs-extra';
import { BufferReader } from '../utils';

/** @typedef {import('common/types').FileHandler} FileHandler */

/**
 * @typedef {object} Header
 * @prop {number} compressionLevel
 * @prop {number} formatFlags
 * @prop {number} blocksPerFrame
 * @prop {number} finalFrameBlocks
 * @prop {number} totalFrames
 * @prop {number} bitsPerSample
 * @prop {number} nChannels
 * @prop {number} sampleRate
 * @prop {string} hash
 */

/**
 * @param {Header} info
 */
function getTotalBlocks(info) {
  if (info.totalFrames === 0) {
    return 0;
  }

  return ((info.totalFrames - 1) * info.blocksPerFrame) + info.finalFrameBlocks;
}

/**
 * @param {number} fd
 * @returns {Promise<Header>}
 */
async function readHeader(fd) {
  const buf = Buffer.alloc(76);
  await fs.read(fd, buf, 0, buf.length, 0);

  const br = new BufferReader(buf, false);
  const signature = br.lstring(4, 'ascii');

  if (signature !== 'MAC ') {
    throw new Error('Not a Monkey\'s Audio file');
  }

  const version = br.uint16();
  br.skip(2);
  const nDescriptorBytes = br.uint32();
  /* const nHeaderBytes = br.uint32(); */
  /* const nSeekTableBytes = br.uint32(); */
  /* const nHeaderDataBytes = br.uint32(); */
  /* const nAPEFrameDataBytes = br.uint32(); */
  /* const nAPEFrameDataBytesHigh = br.uint32(); */
  /* const nTerminatingDataBytes = br.uint32(); */
  const md5 = br.seek(36).uint32();

  if (version >= 3980) {
    br.seek(nDescriptorBytes);

    return {
      compressionLevel: br.uint16(),
      formatFlags: br.uint16(),
      blocksPerFrame: br.uint32(),
      finalFrameBlocks: br.uint32(),
      totalFrames: br.uint32(),
      bitsPerSample: br.uint16(),
      nChannels: br.uint16(),
      sampleRate: br.uint32(),
      hash: md5.toString(16),
    };
  }

  throw new Error('Monkey\'s Audio file version below 3980 is not supported');
}

/** @type FileHandler */
export default async function apeHandler({ file }) {
  const fd = await fs.open(file.path, 'r');
  const info = await readHeader(fd);
  await fs.close(fd);

  const totalBlocks = getTotalBlocks(info);

  return [{
    tracks: [{
      duration: totalBlocks / info.sampleRate,
      nChannels: info.nChannels,
      sampleRate: info.sampleRate,
      file: {
        ...file,
        hash: info.hash,
      },
    }],
  }];
}
