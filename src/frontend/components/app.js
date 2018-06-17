import React from 'react';
import { MemoryRouter, Switch, Route, Redirect } from 'react-router';
import { IntlProvider } from 'react-intl';
import { Controls, Library, Preferences } from '.';

const App = () => (
  <IntlProvider locale="en">
    <MemoryRouter>
      <div className="app">
        <Controls />

        <Switch>
          <Route path="/preferences" component={Preferences} />
          <Route path="/library" component={Library} />
          <Redirect to="/library" />
        </Switch>
      </div>
    </MemoryRouter>
  </IntlProvider>
);

export { App };
