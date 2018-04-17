import _ from 'lodash';
import {ipcRenderer} from 'electron';
import {defer} from './util';

const calls = [];
let uniqid = 0;

ipcRenderer.on('_remote_call', (event, {id, val, err}) => {
  _(calls)
    .remove({id})
    .each(call => {
      if (err) {
        call.def.reject(new Error(val));
      } else {
        call.def.resolve(val);
      }
    });
});

export function remoteCall(name, ...args) {
  const id = uniqid++;
  const def = defer();
  calls.push({id, name, def});
  ipcRenderer.send('_remote_call', {id, name, args});
  return def.promise;
}
