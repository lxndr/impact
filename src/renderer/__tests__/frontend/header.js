import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import Header from '../../components/header';

describe('Header component', () => {
  let cmp;

  it('renders', () => {
    cmp = mount((
      <IntlProvider locale="en">
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </IntlProvider>
    ));
  });

  it('set track and state', () => {
    store.playback.track = {
      id: 1,
      title: 'Title',
      duration: 5000,
      album: {
        title: 'Album',
        artist: 'Artist',
      },
    };

    store.playback.state = {
      state: 'playing',
      position: 15,
    };
  });

  it('set track with empty tags', () => {
    store.playback.track = {
      id: 1,
      duration: 5000,
      album: {
      },
    };
  });

  it('should handle button clicks', () => {
    ['prev', 'play', 'next', 'wmin', 'wmax', 'wcls', 'pref'].forEach(cls => (
      cmp.find(`.${cls}`).first().simulate('click')
    ));
  });

  afterAll(async () => {
    await store.deinit();
  });
});
