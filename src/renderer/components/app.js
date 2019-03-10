import React, { useEffect } from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import messages from '../l18n';
import style from '../style';
import Header from './header';
import Library from './library';
import backend from '../services/backend';
import Preferences from './preferences';

addLocaleData([...en, ...ru]);

const App = () => {
  useEffect(() => {
    backend.startup();
  }, []);

  return (
    <IntlProvider locale="en" messages={messages.en}>
      <BrowserRouter>
        <div className={style('app')}>
          <Header />

          <Switch>
            <Route path="/preferences" component={Preferences} />
            <Route path="/library/by-artist/:artist?" component={Library} />
            <Redirect to="/library/by-artist" />
          </Switch>
        </div>
      </BrowserRouter>
    </IntlProvider>
  );
};

export default App;
