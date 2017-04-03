import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router';
import {App} from './app';

const node = document.getElementById('app-container');

const app = (
  <MemoryRouter>
    <App/>
  </MemoryRouter>
);

ReactDOM.render(app, node);
