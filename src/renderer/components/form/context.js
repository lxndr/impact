import React from 'react';

const defaultValue = { model: {}, readOnly: false };
const FormContext = React.createContext(defaultValue);

export default FormContext;
