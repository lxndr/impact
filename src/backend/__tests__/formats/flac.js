import path from 'path';
import flacParser from '../../formats/flac';

describe('FLAC parser', () => {
  it('opens file without tags', async () => {
    const filename = path.join(__dirname, '../fixtures/audio-01.flac');
    const data = await flacParser({ filename });
    expect(data).toMatchSnapshot();
  });

  it('opens file with tags', async () => {
    const filename = path.join(__dirname, '../fixtures/audio-02.flac');
    const data = await flacParser({ filename });
    expect(data).toMatchSnapshot();
  });
});
