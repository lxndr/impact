import React from 'react';
import PropTypes from 'prop-types';
import {MemoryRouter, Switch, Route, Redirect} from 'react-router';
import {remote} from 'electron';
import {Controls} from './components/controls';
import {Library} from './components/library';
import {Preferences} from './components/preferences';

export class App extends React.Component {
  static childContextTypes = {
    app: PropTypes.any
  }

  getChildContext() {
    return {
      app: remote.require('../app').impact
    };
  }

  render() {
    return (
      <MemoryRouter>
        <div className="app">
          <Controls/>

          <Switch>
            <Route path="/preferences" component={Preferences}/>
            <Route path="/library" component={Library}/>
            <Redirect to="/library"/>
          </Switch>
        </div>
      </MemoryRouter>
    );
  }
}
