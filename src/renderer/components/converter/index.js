import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import { Form, Field } from '../form';
import messages from '../../messages';

/**
 * @typedef {import('react-intl').InjectedIntl} InjectedIntl
 */

/**
 * @param {object} props
 * @param {InjectedIntl} props.intl
 */
const Converter = ({ intl }) => {
  const [value, setValue] = useState({
    outputDirectory: '',
    namingPattern: '[track.name]',
    format: 'mp3',
    quality: 'high',
  });

  const handleSubmit = () => {
  };

  return (
    <Form value={value} onChange={setValue} onSubmit={handleSubmit}>
      <Field
        name="preset"
        label="Preset"
      />

      <Field
        name="outputDirectory"
        label="Output directory"
      />

      <Field
        name="namingPattern"
        label="Naming pattern"
      />

      <Field
        name="format"
        label={intl.formatMessage(messages.coverter.format)}
      />

      <Field
        name="quality"
        label={intl.formatMessage(messages.coverter.quality)}
      />

      <button type="submit">Save</button>
    </Form>
  );
};

export default injectIntl(Converter);
