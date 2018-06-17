import React from 'react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { store } from '../store';
import { Preferences } from '.';

let cmp;

test('component', () => {
  cmp = mount((
    <Provider store={store}>
      <MemoryRouter>
        <Preferences />
      </MemoryRouter>
    </Provider>
  ));
});

test('save', () => {
  const input = cmp.find('input#libraryPath');
  input.value = 'new path';
  input.simulate('change');

  // cmp.find('[type="submit"]').simulate('click');
  cmp.find('form').simulate('submit');
});

test('cancel', () => {
  cmp.find('[type="button"]').simulate('click');
});
