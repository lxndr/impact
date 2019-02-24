import { useState, useEffect } from 'react';
import backend from './backend';

/** @typedef {import('common/types').Track} Track */

const usePlaybackState = () => {
  const [state, setState] = useState(backend.playback.state$.value);

  useEffect(() => {
    const sub = backend.playback.state$.subscribe(setState);
    return () => sub.unsubscribe();
  }, []);

  return state;
};

export default usePlaybackState;
