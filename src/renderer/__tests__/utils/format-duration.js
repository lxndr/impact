import formatDuration from '../../utils/format-duration';

test('0 seconds', () => {
  const r = formatDuration(0);
  expect(r).toBe('0:00');
});

test('less than an hour', () => {
  const r = formatDuration(3000);
  expect(r).toBe('50:00');
});

test('more than an hour', () => {
  const r = formatDuration(4000);
  expect(r).toBe('1:06:40');
});
