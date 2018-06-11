import {readVorbisComment} from './vorbis';
import fs from 'fs-extra';

async function readBlockHeader(fd, offset) {
  const buf = Buffer.alloc(4);

  await fs.read(fd, buf, 0, 4, offset);

  return {
    last: buf.readUInt8(0) >> 7,
    type: buf.readUInt8(0) & 0x7f,
    length: buf.readUInt32BE(0) & 0xffffff
  };
}

async function readStreamInfo(fd, buf) {
  if (buf.length < 34) {
    throw new Error('Not a FLAC file');
  }

  return {
    sampleRate: buf.readUInt32BE(10) >> 12,
    nChannels: ((buf.readUInt8(12) & 0xe) >> 1) + 1,
    bitsPerSample: ((buf.readUInt16BE(12) & 0x1f0) >> 4) + 1,
    totalSamples: buf.readUInt32BE(14)  /* FIXME: has to be 36 bits */
  };
}

export async function read(fd) {
  let streamInfo;
  let tags;
  let offset = 4;

  const buf = Buffer.alloc(4);
  await fs.read(fd, buf, 0, 4, 0);

  const signature = buf.toString('ascii', 0, 4);
  if (signature !== 'fLaC') {
    throw new Error('Not a FLAC file');
  }

  for (;;) {
    const block = await readBlockHeader(fd, offset);
    offset += 4;

    const buf = Buffer.alloc(block.length);
    await fs.read(fd, buf, 0, block.length, offset);

    if (block.length <= 0) {
      throw new Error('Block is empty');
    }

    if (block.type === 0) {
      streamInfo = await readStreamInfo(fd, buf);
    } else if (block.type === 4) {
      tags = await readVorbisComment(fd, buf);
    }

    if (block.last) {
      break;
    }

    offset += block.length;
  }

  return {
    sampleRate: streamInfo.sampleRate,
    nChannels: streamInfo.nChannels,
    bitsPerSample: streamInfo.bitsPerSample,
    duration: Math.ceil(streamInfo.totalSamples / streamInfo.sampleRate),
    ...tags
  };
}

export default async function ({file}) {
  const fd = await fs.open(file, 'r');
  const info = await read(fd);
  await fs.close(fd);

  const album = {
    artist: info.albumArtist || null,
    title: info.album,
    releaseDate: info.releaseDate,
    releaseType: info.releaseType,
    discTitle: info.discTitle,
    discNumber: info.discNumber
  };

  const track = {
    title: info.title,
    genre: info.genre,
    number: info.number,
    duration: info.duration
  };

  return {type: 'media', data: {album, track}};
}
