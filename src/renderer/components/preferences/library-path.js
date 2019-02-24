import React from 'react';

export default class LibraryPath extends React.PureComponent {
  handleChange = ({ target: { value } }) => {
    const paths = value.split('\n').filter(path => !!path);
    this.props.onChange(paths);
  }

  render() {
    const value = this.props.value.join('\n');
    return <textarea value={value} onChange={this.onChange} />;
  }
}
