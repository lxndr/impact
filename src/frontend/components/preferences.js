import React from 'react';
import { withRouter } from 'react-router';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { Form, Field } from './form';
import { historyShape } from '../utils';
import store from '../store';

@withRouter
@injectIntl
@observer
export default class Preferences extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    history: historyShape.isRequired,
  }

  handleBack = () => {
    const { history } = this.props;
    history.goBack();
  }

  render() {
    const { intl } = this.props;

    return (
      <div className="preferences">
        <Form model={store.config}>
          <Field
            name="libraryPath"
            label={intl.formatMessage({
              id: 'preferences.libraryPath',
              defaultMessage: 'Music library path',
            })}
          />

          <button type="submit" onSubmit={this.handleBack}>
            <FormattedMessage id="prefernces.save" defaultMessage="Save" />
          </button>

          <button type="button" onClick={this.handleBack}>
            <FormattedMessage id="prefernces.back" defaultMessage="Back" />
          </button>
        </Form>
      </div>
    );
  }
}
