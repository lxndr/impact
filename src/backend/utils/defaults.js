import R from 'ramda';

const omitUndefined = R.pickBy(val => typeof val !== 'undefined');

/**
 * @template T, S
 * @param {T} target
 * @param {S} source
 */
const defaults = (target, source) => ({
  ...source,
  ...omitUndefined(target),
});

export default defaults;
