import path from 'path';
import flacParser from '../../formats/flac';

/**
 * @param {string} filename
 */
const createFile = filename => ({
  type: 'media',
  path: path.join(__dirname, filename),
  mtime: new Date(),
  size: 0,
  hash: '',
});

const scanner = {
  inspect: jest.fn(),
};

describe('FLAC parser', () => {
  it('opens file without tags', async () => {
    const file = createFile('../fixtures/audio-01.flac');
    const data = await flacParser({ file, scanner });
    expect(data).toMatchSnapshot();
  });

  it('opens file with tags', async () => {
    const file = createFile('../fixtures/audio-02.flac');
    const data = await flacParser({ file, scanner });
    expect(data).toMatchSnapshot();
  });
});
