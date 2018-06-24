import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store, initApplication } from './store';
import { App } from './components';

store.dispatch(initApplication());

const app = (
  <Provider store={store}>
    <App />
  </Provider>
);

const container = document.getElementById('app');
ReactDOM.render(app, container);
