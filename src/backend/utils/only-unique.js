/**
 * @template T
 * @param {T} val
 * @param {number} idx
 * @param {T[]} arr
 */
const onlyUnique = (val, idx, arr) => arr.indexOf(val) === idx;

export default onlyUnique;
