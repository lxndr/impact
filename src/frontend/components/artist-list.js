import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import cn from 'classnames';
import {withBackend} from '../backend-context';

class Artist extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string,
    selected: PropTypes.bool,
    onClick: PropTypes.func.isRequired
  }

  static defaultProps = {
    name: null,
    selected: false
  }

  render() {
    const {name, selected} = this.props;
    const className = cn({selected, unknown: !name});

    return (
      <li className={className}>
        <a href="#" onClick={this.handleClick}>{name || 'Unknown artist'}</a>
      </li>
    );
  }

  @autobind
  handleClick() {
    this.props.onClick(this.props.name);
  }
}

@withBackend
export default class ArtistList extends React.PureComponent {
  static propTypes = {
    backend: PropTypes.any.isRequired,
    onSelect: PropTypes.func.isRequired
  }

  state = {
    artists: [],
    selected: ''
  }

  render() {
    return (
      <div className="artist-list">
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
      </div>
    );
  }

  componentDidMount() {
    this.refresh().catch(console.error);
  }

  async refresh() {
    const {backend} = this.props;
    const artists = await backend.collection.artists();
    this.setState({artists});
  }

  @autobind
  handleClick(selected) {
    this.setState({selected});
    this.props.onSelect(selected);
  }
}
