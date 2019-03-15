import React, { useState } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Form, Field } from '../form';
import style from '../../style';
import { backend, useRouter } from '../../services';

/**
 * @typedef {import('react-intl').InjectedIntl} InjectedIntl
 */

/**
 * @param {object} props
 * @param {InjectedIntl} props.intl
 */
const Preferences = ({ intl }) => {
  const [value, setValue] = useState({
    libraryPath: '',
  });

  const handleSubmit = () => {};

  const { history } = useRouter();
  const handleBack = () => history.goBack();
  const handleUpdateLibrary = () => backend.scanner.update();
  const handleClearLibrary = () => backend.collection.clear();

  return (
    <div className={style('preferences')}>
      <Form value={value} onChange={setValue} onSubmit={handleSubmit}>
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

      <button className="update-library" type="button" onClick={handleUpdateLibrary}>
        <FormattedMessage id="prefernces.updateLibrary" defaultMessage="Update library" />
      </button>

      <button className="clear-library" type="button" onClick={handleClearLibrary}>
        <FormattedMessage id="prefernces.clearLibrary" defaultMessage="Clear libray" />
      </button>
    </div>
  );
};

export default injectIntl(Preferences);
