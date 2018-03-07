import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import cn from 'classnames';

class Artist extends React.Component {
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

export class ArtistList extends React.Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired
  }

  static contextTypes = {
    app: PropTypes.any
  }

  state = {
    artists: [],
    selected: null
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
    const {app} = this.context;
    const artists = await app.collection.artists();
    this.setState({artists});
  }

  @autobind
  handleClick(selected) {
    this.setState({selected});
    this.props.onSelect(selected);
  }
}
