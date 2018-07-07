import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

const Empty = () => {
  const link = (
    <Link to="/preferences">
      <FormattedMessage
        id="library.empty.link"
        defaultMessage="the preferences"
        values={{
          link: <Link to="/preferences">the preferences</Link>,
        }}
      />
    </Link>
  );

  return (
    <div className="empty">
      <div className="message">
        <FormattedMessage
          id="library.empty.message"
          defaultMessage="Your library is empty. You need to specify path to your music collection in {link}"
          values={{ link }}
        />
      </div>
    </div>
  );
};

export default Empty;
