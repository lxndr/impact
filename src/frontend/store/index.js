import { createStore, combineReducers, applyMiddleware } from 'redux';
import { reducer as formReducer } from 'redux-form';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { libraryReducer } from './library';
import { configReducer } from './config';
import { playbackReducer, playbackSaga } from './playback';
import { windowSaga } from './window';

export * from './config';
export * from './library';
export * from './playback';
export * from './window';

const sagaMiddleware = createSagaMiddleware();

const reducer = combineReducers({
  form: formReducer,
  playback: playbackReducer,
  library: libraryReducer,
  config: configReducer,
});

const store = createStore(reducer, applyMiddleware(
  sagaMiddleware,
));

sagaMiddleware.run(function* rootSaga() {
  yield fork(playbackSaga);
  yield fork(windowSaga);
});

export { store };
