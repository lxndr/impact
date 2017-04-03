import React from 'react';
import {Switch, Route, Redirect} from 'react-router';
import {Controls} from './components/controls';
import {Library} from './components/library';
import {Preferences} from './components/preferences';

export class App extends React.Component {
  render() {
    return (
      <app>
        <Route component={Controls}/>

        <Switch>
          <Route path="/preferences" component={Preferences}/>
          <Route path="/library" component={Library}/>
          <Redirect to={'/library'}/>
        </Switch>
      </app>
    );
  }
}
