import {
  DEFAULT_ROLES,
  paletteDefault,
} from '../presets/color-roles/decisions';
import { manifest } from '../presets/color-roles/manifest';

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

  it('keep dark navy fills for design', () => {
    expect(paletteDefault('navy-600', 'the `bg` prop')).toBeNull();
  });
});
