import {
  compose,
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';

import { reducer as formReducer } from 'redux-form';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { Application } from '../../backend';
import { libraryReducer, librarySaga } from './library';
import { configReducer } from './config';
import { coreSaga } from './core';
import { playbackReducer, playbackSaga } from './playback';
import { windowSaga } from './window';

export * from './config';
export * from './core';
export * from './library';
export * from './playback';
export * from './window';

const backend = new Application();
const sagaMiddleware = createSagaMiddleware();

const reducer = combineReducers({
  backend: (state = backend) => state,
  form: formReducer,
  config: configReducer,
  library: libraryReducer,
  playback: playbackReducer,
});

const composeEnhancers = global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(function* rootSaga() {
  yield fork(coreSaga);
  yield fork(librarySaga);
  yield fork(playbackSaga);
  yield fork(windowSaga);
});

export { store };
