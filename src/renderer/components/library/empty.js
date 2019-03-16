import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import messages from '../../messages';

const Empty = () => {
  const link = (
    <Link to="/preferences">
      <FormattedMessage {...messages.emptyLibrary.link} />
    </Link>
  );

  return (
    <div className="empty">
      <div className="message">
        <FormattedMessage {...messages.emptyLibrary.message} values={{ link }} />
      </div>
    </div>
  );
};

export default React.memo(Empty);
