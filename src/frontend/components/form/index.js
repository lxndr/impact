import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { observer, Provider } from 'mobx-react';
import { modelShape } from './util';

export { default as Field } from './field';

@observer
export class Form extends React.Component {
  static propTypes = {
    model: modelShape.isRequired,
    readOnly: PropTypes.bool,
    onSubmit: PropTypes.func,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    readOnly: false,
    onSubmit: _.noop,
  };

  handleSubmit = () => {
    const { onSubmit } = this.props;
    onSubmit();
  }

  render() {
    const { model, readOnly, children } = this.props;

    const formData = {
      model,
      readOnly,
    };

    return (
      <Provider form={formData}>
        <form onSubmit={this.handleSubmit}>
          {children}
        </form>
      </Provider>
    );
  }
}
