import {bindKey} from 'lodash';
import React from 'react';
import {collection} from '../store';

export class ArtistList extends React.Component {
  static propTypes = {
    onSelect: React.PropTypes.func
  }

  state = {
    artists: [],
    selected: null
  }

  render() {
    return (
      <artist-list>
        <ul>
          {this.state.artists.map(artist => {
            const itemClass = artist === this.state.selected ? 'selected' : undefined;

            return (
              <li key={artist} className={itemClass}>
                <a href="#" onClick={bindKey(this, '_onSelect', artist)}>
                  {artist}
                </a>
              </li>
            );
          })}
        </ul>
      </artist-list>
    );
  }

  componentDidMount() {
    this._update();
    this.updateSubscription = collection.update$.subscribe(bindKey(this, '_update'));
  }

  componentWillUnmount() {
    this.updateSubscription.unsubscribe();
  }

  _update() {
    collection.artists().then(artists => {
      this.setState({
        artists: artists.sort()
      });
    }, err => {
      console.error(err.message);
    });
  }

  _onSelect(selected) {
    this.setState({selected});
    this.props.onSelect(selected);
  }
}
