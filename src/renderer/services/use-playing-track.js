import { useState, useEffect } from 'react';
import backend from './backend';

/** @typedef {import('common/types').Track} Track */

const usePlayingTrack = () => {
  const [track, setTrack] = useState(backend.playback.track$.value);

  useEffect(() => {
    const sub = backend.playback.track$.subscribe(setTrack);
    return () => sub.unsubscribe();
  }, []);

  return track;
};

export default usePlayingTrack;
