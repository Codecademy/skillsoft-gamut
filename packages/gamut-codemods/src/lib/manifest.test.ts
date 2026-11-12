import { describe, expect, it } from 'vitest';

import { isAtLeast, isNewerThan, minVersion } from './manifest';

describe('isNewerThan', () => {
  it.each([
    ['74.0.0', '73.6.1', true],
    ['^73.7.0', '73.6.1', true],
    ['~73.6.2', '73.6.1', true],
    ['npm:@codecademy/gamut@74.0.0', '73.6.1', true],
    ['73.6.1', '73.6.1', false],
    ['^73.0.0', '73.6.1', false],
    ['74.0.0-alpha.1', '74.0.0', false],
    ['*', '73.6.1', false],
    ['workspace:*', '73.6.1', false],
    ['https://example.com/gamut.tgz', '73.6.1', false],
  ])('%s vs %s -> %s', (range, version, expected) => {
    expect(isNewerThan(range, version)).toBe(expected);
  });

  it('reads the lowest version a range allows', () => {
    expect(minVersion('>= 1.2.3')).toEqual([1, 2, 3]);
    expect(minVersion('latest')).toBeNull();
  });
});

describe('isAtLeast', () => {
  it.each([
    ['74.0.0', true],
    ['^74.1.0', true],
    ['~75.0.0', true],
    ['73.6.3', false],
    ['^73.6.1', false],
    ['*', false],
  ])('%s >= 74.0.0 is %s', (range, expected) => {
    expect(isAtLeast(range, '74.0.0')).toBe(expected);
  });
});
