import React from 'react';
import {Controls} from './controls';

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      track: {
        title: 'Title 1',
        album: 'Album 1',
        artist: 'Artist 1'
      }
    };
  }

  render() {
    return (
      <app>
        <Controls track={this.state.track}/>
        {this.props.children}
      </app>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.any
};
