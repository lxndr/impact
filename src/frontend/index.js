import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import { store } from './store';
import { App } from './components';

store.init();

const app = (
  <Provider store={store}>
    <App />
  </Provider>
);

render(app, document.getElementById('app'));
