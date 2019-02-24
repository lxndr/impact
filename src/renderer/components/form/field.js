import _ from 'lodash';
import React, { useContext } from 'react';
import cn from 'classnames';
import FormContext from './context';

/**
 * @param {object} props
 * @param {string | React.Component} [props.type]
 * @param {string} [props.className]
 * @param {string} props.name
 * @param {string} [props.label]
 * @param {string} [props.labelClass]
 * @param {boolean} [props.readOnly]
 * @param {...*} rest
 */
const Field = ({
  type = 'text',
  className = '',
  name,
  label = null,
  labelClass = '',
  readOnly = false,
  ...rest
}) => {
  const form = useContext(FormContext);

  /** @type {React.ChangeEventHandler} */
  const handleChange = (event) => {
    const { form, name, ...props } = this.props;
    let value = event;

    if (event && typeof event === 'object' && event.target) {
      const { target } = event;

      if (target.type === 'checkbox') {
        if (props.value) {
          const old = _.get(form.model, name);

          if (target.checked) {
            value = _.union(old, [props.value]);
          } else {
            value = _.without(old, props.value);
          }
        } else {
          value = target.cheked;
        }
      } else if (target.type === 'radio') {
        if (target.checked) {
          value = target.value;
        }
      } else {
        value = target.value;
      }
    }

    _.set(form.model, name, value);
  };

  const value = _.get(form.model, name);
  let Component = type;

  const props = {
    id: name,
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
      if (rest.value) {
        props.id += `_${rest.value}`;
        props.checked = Array.isArray(value) && value.includes(rest.value);
      } else {
        props.checked = value || false;
      }
    } else if (props.type === 'radio') {
      props.checked = value === (rest.value || false);
    } else {
      props.value = value || '';
    }
  }

  return (
    <div className={cn('form-field', `form-field_${name}`, className)}>
      {label && (
        <label className={labelClass} htmlFor={props.id}>
          {label}
        </label>
      )}

      <Component {...props} {...rest} />
    </div>
  );
};

export default Field;
