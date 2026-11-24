import { describe, expect, it } from 'vitest';
import { DEFAULT_ROLES, paletteDefault } from './presets/color-roles/decisions';
import { manifest } from './presets/color-roles/manifest';

describe('palette defaults', () => {
  it('only name roles the generated system has', () => {
    for (const role of DEFAULT_ROLES) {
      expect(manifest.roles).toContain(role);
    }
  });

  it('leave a color alone when its use is not known', () => {
    expect(paletteDefault('red-500', 'a theme.colors lookup')).toBeNull();
    expect(paletteDefault('red-500', 'a CSS variable')).toBeNull();
  });

  it('map hyper, the old primary, to action-primary', () => {
    expect(paletteDefault('hyper', 'the `bg` prop')).toBe('action-primary');
    expect(paletteDefault('hyper-500', 'the `color` prop')).toBe(
      'action-primary'
    );
    expect(paletteDefault('hyper-400', 'the `bg` prop')).toBeNull();
    expect(paletteDefault('yellow', 'the `bg` prop')).toBeNull();
  });

  it('map the warning family, yellow-0 fills and yellow ink, and leave the accent to a person', () => {
    expect(paletteDefault('yellow-0', 'the `bg` prop')).toBe('surface-warning');
    expect(paletteDefault('yellow', 'the `color` prop')).toBe('text-warning');
    expect(paletteDefault('yellow-900', 'the `textColor` prop')).toBe(
      'text-warning'
    );
    expect(paletteDefault('yellow', 'the `bg` prop')).toBeNull();
    expect(paletteDefault('yellow-500', 'the `bg` prop')).toBeNull();
    expect(paletteDefault('yellow-400', 'the `color` prop')).toBeNull();
  });

  it('map blue-500 text to action-primary, and leave blue fills to a person', () => {
    expect(paletteDefault('blue-500', 'the `color` prop')).toBe(
      'action-primary'
    );
    expect(paletteDefault('blue', 'the `textColor` prop')).toBe(
      'action-primary'
    );
    expect(paletteDefault('blue-500', 'the `bg` prop')).toBeNull();
    expect(paletteDefault('blue-500', 'the `borderColor` prop')).toBeNull();
    expect(paletteDefault('blue-300', 'the `color` prop')).toBeNull();
  });

  it('follow the use for greys, and keep light grey text for a person', () => {
    expect(paletteDefault('gray-100', 'the `bg` prop')).toBe('surface-default');
    expect(paletteDefault('gray-300', 'the `bg` prop')).toBe('surface-sunken');
    expect(paletteDefault('gray-800', 'the `color` prop')).toBe('text-subtle');
    expect(paletteDefault('gray-300', 'the `borderColor` prop')).toBe(
      'border-subtle'
    );
    expect(paletteDefault('gray-900', 'the `borderColor` prop')).toBe(
      'border-default'
    );
    expect(paletteDefault('gray-100', 'the `color` prop')).toBeNull();
  });

  it('keep dark navy fills for design', () => {
    expect(paletteDefault('navy-600', 'the `bg` prop')).toBeNull();
  });
});
