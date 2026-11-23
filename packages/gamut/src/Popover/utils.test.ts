import { describe, expect, it } from 'vitest';

import { resolveHorizontalSideForRtl } from './utils';

describe('resolveHorizontalSideForRtl', () => {
  it.each([
    {
      side: 'start' as const,
      isRtl: false,
      useLogicalProperties: false,
      expected: 'left',
    },
    {
      side: 'end' as const,
      isRtl: false,
      useLogicalProperties: false,
      expected: 'right',
    },
    {
      side: 'start' as const,
      isRtl: true,
      useLogicalProperties: false,
      expected: 'left',
    },
    {
      side: 'end' as const,
      isRtl: true,
      useLogicalProperties: false,
      expected: 'right',
    },
    {
      side: 'start' as const,
      isRtl: false,
      useLogicalProperties: true,
      expected: 'left',
    },
    {
      side: 'end' as const,
      isRtl: false,
      useLogicalProperties: true,
      expected: 'right',
    },
    {
      side: 'start' as const,
      isRtl: true,
      useLogicalProperties: true,
      expected: 'right',
    },
    {
      side: 'end' as const,
      isRtl: true,
      useLogicalProperties: true,
      expected: 'left',
    },
  ])(
    '$side when isRtl=$isRtl useLogicalProperties=$useLogicalProperties → $expected',
    ({ side, isRtl, useLogicalProperties, expected }) => {
      expect(
        resolveHorizontalSideForRtl({ side, isRtl, useLogicalProperties })
      ).toBe(expected);
    }
  );

  it('treats undefined useLogicalProperties like false', () => {
    expect(
      resolveHorizontalSideForRtl({
        side: 'start',
        isRtl: true,
        useLogicalProperties: undefined,
      })
    ).toBe('left');
  });
});
