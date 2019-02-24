import React from 'react';
import { withRouter } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Form, Field } from '../form';
import store from '../../store';
import style from '../../style';

const Preferences = ({
  history,
  intl,
}) => {
  const handleBack = () => history.goBack();

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
          <button type="button" onClick={handleBack}>
            <FormattedMessage id="prefernces.back" defaultMessage="Back" />
          </button>

          <button type="submit" onSubmit={handleBack}>
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
};

export default injectIntl(withRouter(Preferences));
