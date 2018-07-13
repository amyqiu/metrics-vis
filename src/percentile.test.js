import * as percentile from './percentile.js';

test('gets correct percentile index', () => {
  let numbers = [1,2,3,4,5,6,7,8,9,10];
  let index = numbers.indexOf(5);
  expect(percentile.GetPercentileIndex(50, numbers.length)).toBe(index);
});

test('returns zero if negative percentile', () => {
  let numbers = [1,2,3,4,5,6,7,8,9,10];
  let index = 0;
  expect(percentile.GetPercentileIndex(-3, numbers.length)).toBe(index);
});

test('returns last index if percentile greater than 100', () => {
  let numbers = [1,2,3,4,5,6,7,8,9,10];
  let index = 9;
  expect(percentile.GetPercentileIndex(103, numbers.length)).toBe(index);
});

