import React, { useContext } from 'react';
import R from 'ramda';
import cn from 'classnames';
import FormContext from './context';

/**
 * @template T
 * @param {object} props
 * @param {React.ElementType} [props.type]
 * @param {string} [props.className]
 * @param {string} props.name
 * @param {string} [props.label]
 * @param {string} [props.labelClass]
 * @param {boolean} [props.readOnly]
 */
const Field = ({
  type = 'text',
  className,
  name,
  label,
  labelClass,
  readOnly = false,
  ...rest
}) => {
  const form = useContext(FormContext);
  const lens = R.lensPath(name.split('.'));

  /** @type {T} */
  const value = R.view(lens, form.value);

  /** @param {React.ChangeEvent<HTMLInputElement>} event */
  const getInputEventValue = (event) => {
    const { target } = event;

    if (target.type === 'checkbox') {
      return target.checked;
    }

    if (target.type === 'radio') {
      if (target.checked) {
        return target.value;
      }
    }

    return target.value;
  };

  /** @type {React.ChangeEventHandler<HTMLInputElement> | T} */
  const handleChange = (event) => {
    const value = (event && typeof event === 'object' && 'target' in event)
      ? getInputEventValue(/** @type {React.ChangeEvent<HTMLInputElement>} */ event)
      : /** @type {T} */ event;
    const newFormValue = R.set(lens, value, form.value);
    form.onChange(newFormValue);
  };

  let Component = type;
  const id = name;

  const props = {
    name,
    readOnly: readOnly || form.readOnly,
    value,
    onChange: handleChange,
  };

  if (typeof type === 'string') {
    if (type === 'textarea') {
      Component = 'textarea';
      delete props.type;
    } else {
      Component = 'input';
      props.type = type;
    }
  }

  if (Component === 'input' || Component === 'textarea') {
    if (props.type === 'checkbox') {
      props.checked = Boolean(value);
    } else {
      props.value = /** @type {T} */ (value || '');
    }
  }

  return (
    <div className={cn('form-field', `form-field_${name}`, className)}>
      {label && (
        <label className={labelClass} htmlFor={id}>
          {label}
        </label>
      )}

      <Component {...props} {...rest} id={id} />
    </div>
  );
};

export default Field;
