/* eslint-disable jsx-a11y/label-has-for */

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { observer, inject } from 'mobx-react';
import { formShape } from './util';

@inject('form')
@observer
export default class Field extends React.Component {
  static propTypes = {
    form: formShape.isRequired,
    type: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    labelClass: PropTypes.string,
    readOnly: PropTypes.bool,
  };

  static defaultProps = {
    type: 'text',
    className: '',
    label: null,
    labelClass: '',
    readOnly: false,
  };

  handleChange = (event) => {
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
  }

  render() {
    const {
      form,
      type,
      className,
      name,
      label,
      labelClass,
      readOnly,
      ...rest
    } = this.props;

    const value = _.get(form.model, name);
    let Component = type;

    const props = {
      id: name,
      name,
      readOnly: readOnly || form.readOnly,
      value,
      onChange: this.handleChange,
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
  }
}
