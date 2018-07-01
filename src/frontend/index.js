import React from 'react';
import { render } from 'react-dom';
import { store } from './store';
import { App } from './components/app';

store.init();

render(<App />, document.getElementById('app'));
