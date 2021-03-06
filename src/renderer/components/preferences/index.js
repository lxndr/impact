import React, { useState } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { Form, Field } from '../common';
import style from '../../style';
import { backend } from '../../services';
import { useRouter } from '../../utils';
import messages from '../../messages';

/**
 * @typedef {import('react-intl').InjectedIntl} InjectedIntl
 */

/**
 * @param {object} props
 * @param {InjectedIntl} props.intl
 */
const Preferences = ({ intl }) => {
  const [value, setValue] = useState({
    libraryPath: backend.configuration.libararyPath,
  });

  const handleSubmit = () => {
    backend.configuration.set(value);
  };

  const { history } = useRouter();
  const handleBack = () => history.goBack();
  const handleUpdateLibrary = () => backend.scanner.update();
  const handleClearLibrary = () => backend.library.clear();

  return (
    <div className={style('preferences')}>
      <Form value={value} onChange={setValue} onSubmit={handleSubmit}>
        <Field
          name="libraryPath"
          label={intl.formatMessage(messages.preferences.libraryPath)}
        />

        <div className="action-bar">
          <button type="button" onClick={handleBack}>
            <FormattedMessage {...messages.generic.back} />
          </button>

          <button type="submit" onSubmit={handleBack}>
            <FormattedMessage {...messages.generic.save} />
          </button>
        </div>
      </Form>

      <button className="update-library" type="button" onClick={handleUpdateLibrary}>
        <FormattedMessage {...messages.preferences.updateLibrary} />
      </button>

      <button className="clear-library" type="button" onClick={handleClearLibrary}>
        <FormattedMessage {...messages.preferences.clearLibrary} />
      </button>

      <div>
        <br />
        <Link to="/music/by-artist/">Music</Link>
        <br />
        <Link to="/pictures">Pictures</Link>
        <br />
        <Link to="/collections">Collections</Link>
      </div>
    </div>
  );
};

export default injectIntl(Preferences);
