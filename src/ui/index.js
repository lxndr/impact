import React from 'react';
import ReactDOM from 'react-dom';
import ready from 'document-ready';
import '@fortawesome/fontawesome-free-solid';
import {App} from './app';

ready(() => {
  ReactDOM.render(<App/>, document.getElementById('app'));
});
