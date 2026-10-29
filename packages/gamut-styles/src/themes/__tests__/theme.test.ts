import { adminTheme } from '../admin';
import { coreTheme } from '../core';
import { lxStudioTheme } from '../lxStudio';
import { percipioTheme } from '../percipio';
import { platformTheme } from '../platform';

describe('themes', () => {
  it.each([
    ['core', coreTheme],
    ['platform', platformTheme],
    ['admin', adminTheme],
    ['lxStudio', lxStudioTheme],
    ['percipio', percipioTheme],
  ])(`%s - theme shape`, (_, theme) => expect(theme).toMatchSnapshot());
});

describe('platformTheme', () => {
  it('starts in dark mode', () => {
    expect(platformTheme.mode).toBe('dark');
  });

  it("keeps the code editor's colors, declared in both modes", () => {
    expect(platformTheme.colors['editor-keyword']).toBe(
      'var(--colors-editor-keyword)'
    );
    expect(platformTheme.tokensCss).toContain(
      ':root,[data-color-mode="light"]{--colors-editor-attribute:#008A27;'
    );
    expect(platformTheme.tokensCss).toContain(
      '--colors-editor-keyword:#B3CCFF;'
    );
  });
});

describe('lxStudioTheme', () => {
  it('keeps its own radii', () => {
    expect(lxStudioTheme.borderRadii.md).toBe('8px');
  });
});
