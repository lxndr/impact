import React from 'react';
import PropTypes from 'prop-types';
import {MemoryRouter, Switch, Route, Redirect} from 'react-router';
import {IntlProvider} from 'react-intl';
import {BackendContext} from './backend-context';
import Controls from './components/controls';
import Library from './components/library';
import Preferences from './components/preferences';

export default class App extends React.Component {
  static propTypes = {
    backend: PropTypes.any.isRequired
  }

  render() {
    return (
      <IntlProvider locale="en">
        <MemoryRouter>
          <BackendContext.Provider value={this.props.backend}>
            <div className="app">
              <Controls/>

              <Switch>
                <Route path="/preferences" component={Preferences}/>
                <Route path="/library" component={Library}/>
                <Redirect to="/library"/>
              </Switch>
            </div>
          </BackendContext.Provider>
        </MemoryRouter>
      </IntlProvider>
    );
  }
}
