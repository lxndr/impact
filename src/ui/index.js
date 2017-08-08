import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router';
import {App} from './app';

document.addEventListener('DOMContentLoaded', () => {
  const app = (
    <MemoryRouter>
      <App/>
    </MemoryRouter>
  );

  ReactDOM.render(app, document.body);
}, false);
