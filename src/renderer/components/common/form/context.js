import React from 'react';

const defaultValue = { value: {}, readOnly: false };
const FormContext = React.createContext(defaultValue);

export default FormContext;
