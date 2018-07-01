import React from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

import {
  MemoryRouter,
  Switch,
  Route,
  Redirect,
} from 'react-router';

import messages from '../l18n';
import { Header } from './header';
import { Library } from './library';

addLocaleData([...en, ...ru]);

export const App = () => (
  <IntlProvider locale="en" messages={messages.en}>
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
