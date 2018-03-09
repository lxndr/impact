import React from 'react';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import {Form, Field} from '@lxndr/react-webui';

export class Preferences extends React.Component {
  static contextTypes = {
    app: PropTypes.any
  }

  static propTypes = {
    history: PropTypes.object.isRequired
  }

  state = {
    value: {}
  }

  componentDidMount() {
    this.setState({value: {libraryPath: this.context.app.libraryPath}});
  }

  render() {
    return (
      <div className="preferences">
        <Form value={this.state.value} onChange={this.handleChange} onSubmit={this.handleSubmit} readOnly>
          <Field name="libraryPath" label="Music library path"/>
          <div className="actionbar">
            <button type="submit">Save</button>
            <button type="button" onClick={this.handleCancel}>Cancel</button>
          </div>
        </Form>
      </div>
    );
  }

  @autobind
  handleChange(value) {
    this.setState({value});
  }

  @autobind
  handleSubmit() {
    this.props.history.goBack();
  }

  @autobind
  handleCancel() {
    this.props.history.goBack();
  }
}
