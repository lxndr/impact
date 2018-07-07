import React from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import { observer } from 'mobx-react';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

import {
  MemoryRouter,
  Switch,
  Route,
  Redirect,
} from 'react-router';

import messages from '../l18n';
import store from '../store';
import Header from './header';
import Library from './library';
import Preferences from './preferences';

addLocaleData([...en, ...ru]);

const App = observer(() => {
  const { language } = store.config;

  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <MemoryRouter>
        <div className="app">
          <Header />

          <Switch>
            <Route path="/preferences" component={Preferences} />
            <Route path="/library" component={Library} />
            <Redirect to="/library" />
          </Switch>
        </div>
      </MemoryRouter>
    </IntlProvider>
  );
});

export default App;
