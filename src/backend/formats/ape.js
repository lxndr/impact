import fs from 'fs-extra';

/** @typedef {import('../types').FileHandler} FileHandler */

/**
 * @param {number} fd
 */
async function readHeader(fd) {
  const info = {};
  const buf = Buffer.alloc(76);
  await fs.read(fd, buf, 0, buf.length, 0);

  const signature = buf.toString('ascii', 0, 4);

  if (signature !== 'MAC ') {
    throw new Error('Not a Monkey\'s Audio file');
  }

  const version = buf.readUInt16LE(4);
  const nDescriptorBytes = buf.readUInt32LE(8);
  // const nHeaderBytes = buf.readUInt32LE(12);
  // const nSeekTableBytes = buf.readUInt32LE(16);
  // const nHeaderDataBytes = buf.readUInt32LE(20);
  // const nAPEFrameDataBytes = buf.readUInt32LE(24);
  // const nAPEFrameDataBytesHigh = buf.readUInt32LE(28);
  // const nTerminatingDataBytes = buf.readUInt32LE(32);
  // const md5 = buf.readUInt32LE(36);

  if (version >= 3980) {
    // info.compressionLevel = buf.readUInt16LE(nDescriptorBytes + 0);
    // info.formatFlags = buf.readUInt16LE(nDescriptorBytes + 2);
    info.blocksPerFrame = buf.readUInt32LE(nDescriptorBytes + 4);
    info.finalFrameBlocks = buf.readUInt32LE(nDescriptorBytes + 8);
    info.totalFrames = buf.readUInt32LE(nDescriptorBytes + 12);
    info.bitsPerSample = buf.readUInt16LE(nDescriptorBytes + 16);
    info.nChannels = buf.readUInt16LE(nDescriptorBytes + 18);
    info.sampleRate = buf.readUInt32LE(nDescriptorBytes + 20);
  } else {
    throw new Error('Monkey\'s Audio file version below 3980 is not supported');
  }

  return info;
}

/**
 * @param {string} file
 */
async function parse(file) {
  const fd = await fs.open(file, 'r');
  const info = await readHeader(fd);
  await fs.close(fd);
  return { info };
}

/** @type FileHandler */
export default async function ({ file }) {
  const { info } = await parse(file.path);

  const totalBlocks = info.totalFrames === 0
    ? 0 : ((info.totalFrames - 1) * info.blocksPerFrame) + info.finalFrameBlocks;

  return [{
    tracks: [{
      duration: totalBlocks / info.sampleRate,
      nChannels: info.nChannels,
      sampleRate: info.sampleRate,
      images: [],
    }],
  }];
}
