import React from 'react';
import {routerShape} from 'react-router';
import {Controls} from './controls';

export class App extends React.Component {
  static propTypes = {
    children: React.PropTypes.any,
    router: routerShape
  }

  render() {
    return (
      <app>
        <Controls router={this.props.router}/>
        {this.props.children}
      </app>
    );
  }
}
