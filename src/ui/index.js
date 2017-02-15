import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRedirect, hashHistory} from 'react-router';
import {App} from './components/app';
import {Library} from './components/library';
import {Preferences} from './components/preferences';

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRedirect to="/library"/>
      <Route path="preferences" component={Preferences}/>
      <Route path="library" component={Library}/>
    </Route>
  </Router>
), document.getElementById('app-container'));
