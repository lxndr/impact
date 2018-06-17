import { bootstrap } from '@lxndr/di';
import { Application } from './application';

export function createApplication() {
  return bootstrap(Application);
}
