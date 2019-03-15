import { useState, useEffect } from 'react';

/**
 * @template T
 * @param {import('rxjs').Subscribable<T>} subscribable
 * @param {T} defaultValue
 * @returns T
 */
const useSubscribable = (subscribable, defaultValue) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const subscription = subscribable.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, []);

  return value;
};

export default useSubscribable;
