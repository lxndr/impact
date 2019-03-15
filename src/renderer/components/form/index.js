import React from 'react';
import { noop } from 'common/utils';
import FormContext from './context';

export { default as Field } from './field';

/**
 * @param {object} props
 * @param {object} props.value
 * @param {boolean} [props.readOnly]
 * @param {React.ReactNode} props.children
 * @param {(value: object) => void} props.onChange
 * @param {React.FormEventHandler<HTMLFormElement>} [props.onSubmit]
 */
export const Form = ({
  value,
  readOnly = false,
  children,
  onChange,
  onSubmit = noop,
}) => {
  const formData = {
    value,
    onChange,
    readOnly,
  };

  return (
    <FormContext.Provider value={formData}>
      <form onSubmit={onSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
};
