import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import { changeConfig } from '../store';
import { configShape } from '../utils';

let PreferencesForm = ({ handleSubmit, onCancel }) => (
  <form onSubmit={handleSubmit}>
    <div className="form-field">
      <label htmlFor="libraryPath">Music library path</label>
      <Field id="libraryPath" name="libraryPath" component="input" type="text" />
    </div>

    <div className="actionbar">
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </div>
  </form>
);

PreferencesForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

PreferencesForm = reduxForm({
  form: 'preferences',
})(PreferencesForm);

let Preferences = ({ initialValues, save, cancel }) => (
  <div className="preferences">
    <PreferencesForm initialValues={initialValues} onSubmit={save} onCancel={cancel} />
  </div>
);

Preferences.propTypes = {
  initialValues: configShape.isRequired,
  save: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
};

Preferences = compose(
  withRouter,
  connect(
    state => ({
      initialValues: state.config,
    }),
    (dispatch, props) => ({
      save(value) {
        dispatch(changeConfig(value));
        props.history.goBack();
      },
      cancel() {
        props.history.goBack();
      },
    }),
  ),
)(Preferences);

export { Preferences };
