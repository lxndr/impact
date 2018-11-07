import React from 'react';
import { withRouter } from 'react-router';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { Form, Field } from '../form';
import { historyShape } from '../../utils';
import store from '../../store';
import style from '../../style';

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
      <div className={style('preferences')}>
        <Form model={store.config}>
          <Field
            name="libraryPath"
            label={intl.formatMessage({
              id: 'preferences.libraryPath',
              defaultMessage: 'Music library path',
            })}
          />

          <div className="action-bar">
            <button type="button" onClick={this.handleBack}>
              <FormattedMessage id="prefernces.back" defaultMessage="Back" />
            </button>

            <button type="submit" onSubmit={this.handleBack}>
              <FormattedMessage id="prefernces.save" defaultMessage="Save" />
            </button>
          </div>
        </Form>

        <button className="update-library" type="button" onClick={store.library.update}>
          <FormattedMessage id="prefernces.updateLibrary" defaultMessage="Update library" />
        </button>

        <button className="clear-library" type="button" onClick={store.library.clear}>
          <FormattedMessage id="prefernces.clearLibrary" defaultMessage="Clear libray" />
        </button>
      </div>
    );
  }
}
