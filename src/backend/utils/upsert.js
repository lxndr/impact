import _ from 'lodash';

export default function upsert(array, keys, value) {
  const predicate = _.pick(value, keys);
  const item = _.find(array, predicate);

  if (item) {
    _.assign(item, value);
    return item;
  }

  array.push(value);
  return value;
}
