import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import ready from 'document-ready';
import { createApplication } from '../backend';
import { store } from './store';
import { App } from './components';

async function start() {
  // const backend = createApplication();
  // await backend.startup();

  const app = (
    <Provider store={store}>
      <App />
    </Provider>
  );

  ReactDOM.render(app, document.getElementById('app'));
}

ready(() => {
  start().catch(console.error);
});
