import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import classnames from 'classnames';
import {collection} from '../store';

class Artist extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func.isRequired
  }

  static defaultProps = {
    selected: false
  }

  render() {
    const {name, selected} = this.props;
    const className = classnames({selected});

    return (
      <li className={className}>
        <a href="#" onClick={this.handleClick}>
          {name}
        </a>
      </li>
    );
  }

  @autobind
  handleClick() {
    this.props.onClick(this.props.name);
  }
}

export class ArtistList extends React.Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired
  }

  state = {
    artists: [],
    selected: null
  }

  render() {
    return (
      <artist-list>
        <ul>
          {this.state.artists.map(artist => (
            <Artist
              key={artist}
              name={artist}
              selected={artist === this.state.selected}
              onClick={this.handleClick}
            />
          ))}
        </ul>
      </artist-list>
    );
  }

  componentDidMount() {
    this._update();
    this.updateSubscription = collection.update$.subscribe(() => {
      this._update();
    });
  }

  componentWillUnmount() {
    this.updateSubscription.unsubscribe();
  }

  _update() {
    collection.albumArtists().then(artists => {
      this.setState({
        artists: artists.sort()
      });
    }, err => {
      console.error(err.message);
    });
  }

  @autobind
  handleClick(selected) {
    this.setState({selected});
    this.props.onSelect(selected);
  }
}
