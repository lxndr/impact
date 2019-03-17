/**
 * @template T, M
 * @param {T[]} list
 * @param {(elem: T, index?: number) => M} fn
 * @returns {M[]}
 */
const mapRight = (list, fn) => {
  const res = new Array(list.length);
  let idx = list.length - 1;

  while (idx >= 0) {
    res[idx] = fn(list[idx], idx);
    idx -= 1;
  }

  return res;
};

export default mapRight;
