import { useState, useEffect } from 'react';
import { throttleTime } from 'rxjs/operators';
import backend from './backend';

/** @typedef {import('common/types').Track} Track */

const usePlaybackState = () => {
  const [state, setState] = useState(backend.playback.state$.value);

  useEffect(() => {
    const sub = backend.playback.state$.pipe(throttleTime(250)).subscribe(setState);
    return () => sub.unsubscribe();
  }, []);

  return state;
};

export default usePlaybackState;
