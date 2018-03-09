import _ from 'lodash';
import {ipcMain} from 'electron';

const targets = {};

ipcMain.on('_remote_call', ({sender}, {id, name, args}) => {
  const path = _.toPath(name);
  const targetPath = _.initial(path);
  const funcName = _.last(path);
  const target = _.get(targets, targetPath);
  const val = Reflect.apply(target[funcName], target, args);

  Promise.resolve(val)
    .then(val => sender.send('_remote_call', {id, val}))
    .catch(err => sender.send('_remote_call', {id, err}));
});

export function registerRemoteCallTarget(name, obj) {
  targets[name] = obj;
}
