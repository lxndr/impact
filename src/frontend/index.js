import React from 'react';
import ReactDOM from 'react-dom';
import ready from 'document-ready';
import '@fortawesome/fontawesome-free-solid';
import {createApplication} from '../backend';
import App from './app';

async function start() {
  const backend = createApplication();
  await backend.startup();
  ReactDOM.render(<App backend={backend}/>, document.getElementById('app'));
}

ready(() => {
  start().catch(console.error);
});
