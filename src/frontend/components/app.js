import React from 'react';
import { IntlProvider } from 'react-intl';

import {
  MemoryRouter,
  Switch,
  Route,
  Redirect,
} from 'react-router';

import { Header } from './header';
import { Library } from './library';

const App = () => (
  <IntlProvider locale="en">
    <MemoryRouter>
      <div className="app">
        <Header />

        <Switch>
          {/* <Route path="/preferences" component={Preferences} /> */}
          <Route path="/library" component={Library} />
          <Redirect to="/library" />
        </Switch>
      </div>
    </MemoryRouter>
  </IntlProvider>
);

export { App };
