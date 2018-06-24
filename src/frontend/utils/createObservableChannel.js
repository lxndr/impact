import { eventChannel } from 'redux-saga';

export const createObservableChannel = observable => (
  eventChannel((emit) => {
    const subscription = observable.subscribe((...args) => {
      emit(...args);
    });

    return () => {
      subscription.unsubscribe();
    };
  })
);
