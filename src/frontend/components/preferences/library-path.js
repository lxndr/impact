import React from 'react';
import PropTypes from 'prop-types';

export default class LibraryPath extends React.PureComponent {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  handleChange = ({ target: { value } }) => {
    const paths = value.split('\n').filter(path => !!path);
    this.props.onChange(paths);
  }

  render() {
    const value = this.props.value.join('\n');
    return <textarea value={value} onChange={this.onChange} />;
  }
}
