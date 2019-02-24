import { useState, useEffect } from 'react';

/**
 * @template T
 * @param {import('rxjs').BehaviorSubject<T>} observable
 */
const useObservable = (observable) => {
  const [value, setValue] = useState(observable.value);

  useEffect(() => {
    const subscription = observable.subscribe(value => setValue(value));
    return () => subscription.unsubscribe();
  }, []);

  return value;
};

export default useObservable;
