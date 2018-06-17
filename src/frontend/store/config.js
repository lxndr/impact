import { createAction, createReducer } from 'redux-act';

const initialState = {
  libraryPath: null,
};

export const changeConfig = createAction('config/change');

export const configReducer = createReducer({
  [changeConfig]: (state, config) => config,
}, initialState);
