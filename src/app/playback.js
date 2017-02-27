import _ from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {Player} from './gst';
import * as collection from './collection';

export const track$ = new BehaviorSubject(null);
export const state$ = new BehaviorSubject(null);
export const error$ = new BehaviorSubject(null);
let player = null;
let queue = [];

export function stop() {
  if (player) {
    player.stop();
    player.onprogress = null;
    player.onend = null;
    player.onerror = null;
    player = null;
    track$.next(null);
    state$.next(null);
  }
}

function setup(track) {
  stop();

  player = new Player();

  player.onprogress = secs => {
    state$.next({
      state: state$.value ? state$.value.state : null,
      duration: player.duration,
      position: secs
    });
  };

  player.onstatechange = state => {
    state$.next({
      state,
      duration: player.duration,
      position: player.position
    });
  };

  player.onend = () => {
    next();
  };

  player.onerror = error => {
    console.error(`Error: ${error.message}`);
  };

  player.uri = track.path;

  track$.next(track);
}

async function _play(trackId) {
  stop();

  let track = _.find(queue, {_id: trackId});
  if (!track) {
    track = await collection.trackById(trackId);
  }

  if (track) {
    setup(track);
    player.play();
  }
}

export function play(trackId) {
  _play(trackId).catch(err => {
    console.error(err);
  });
}

export function toggle() {
  if (player) {
    if (state$.value.state === 'playing') {
      player.pause();
    } else {
      player.play();
    }
  }
}

export function previous() {
  const index = _.findIndex(queue, {_id: track$.value._id});
  stop();

  if (index > 0) {
    setup(queue[index - 1]);
    player.play();
  }
}

export function next() {
  const index = _.findIndex(queue, {_id: track$.value._id});
  stop();

  if (index < queue.length - 1) {
    setup(queue[index + 1]);
    player.play();
  }
}

export function clean() {
  stop();
  queue = [];
}

export async function setupPlaylist(fnName, options) {
  queue = [];

  for (const id of options) {
    const track = await collection.trackById(id);
    queue.push(track);
  }
}
