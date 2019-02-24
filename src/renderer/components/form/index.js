import _ from 'lodash';
import React from 'react';
import FormContext from './context';

export { default as Field } from './field';

/**
 * @param {object} props
 * @param {*} props.model
 * @param {boolean} [props.readOnly]
 * @param {React.ReactNode} props.children
 * @param {React.FormEventHandler<HTMLFormElement>} [props.onSubmit]
 */
export const Form = ({
  model,
  readOnly = false,
  children,
  onSubmit = _.noop,
}) => {
  const formData = {
    model,
    readOnly,
  };

  return (
    <FormContext.Provider form={formData}>
      <form onSubmit={onSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
};
