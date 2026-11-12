import {
  coreTheme,
  GamutProvider,
  lxStudioTheme,
  percipioTheme,
  theme,
} from '@skillsoft/gamut-styles';
import { MockGamutProvider } from '@skillsoft/gamut-tests';
import { renderHook } from '@testing-library/react';

import { useCardElevation } from './styles';

const renderElevation = (...args: Parameters<typeof useCardElevation>) =>
  renderHook(() => useCardElevation(...args), {
    wrapper: MockGamutProvider,
  }).result.current;

describe('useCardElevation', () => {
  it('maps the theme elevation tokens onto the motion variants', () => {
    const { animate, initial } = renderElevation('none', 'md');

    expect(initial).toMatchObject({
      boxShadow: theme.elevation['rest-shadow'],
      transform: theme.elevation['rest-transform'],
    });
    expect(animate).toMatchObject({
      boxShadow: theme.elevation['hover-shadow'],
      transform: theme.elevation['hover-transform'],
    });
  });

  it('uses the mirrored hover tokens for patternRight shadows', () => {
    const { animate } = renderElevation('patternRight', 'md');

    expect(animate).toMatchObject({
      boxShadow: theme.elevation['hoverMirrored-shadow'],
      transform: theme.elevation['hoverMirrored-transform'],
    });
  });

  it('applies outline shadows but shares the elevation transforms', () => {
    const { animateOutline, initialOutline } = renderElevation('outline', 'md');

    expect(initialOutline.boxShadow).not.toBe(theme.elevation['rest-shadow']);
    expect(initialOutline.transform).toBe(theme.elevation['rest-transform']);
    expect(animateOutline.boxShadow).not.toBe(theme.elevation['hover-shadow']);
    expect(animateOutline.transform).toBe(theme.elevation['hover-transform']);
  });

  it('passes borderRadius through to every variant', () => {
    const variants = renderElevation('none', 'lg');

    Object.values(variants).forEach((variant) => {
      expect(variant.borderRadius).toBe(theme.borderRadii.lg);
    });
  });

  it.each([
    ['coreTheme', coreTheme],
    ['percipioTheme', percipioTheme],
    ['lxStudioTheme', lxStudioTheme],
  ])('resolves borderRadius from %s', (_name, activeTheme) => {
    (['sm', 'md', 'lg'] as const).forEach((token) => {
      const { result } = renderHook(() => useCardElevation('none', token), {
        wrapper: ({ children }) => (
          <GamutProvider
            theme={activeTheme}
            useCache={false}
            useGlobals={false}
          >
            {children}
          </GamutProvider>
        ),
      });

      expect(result.current.initial.borderRadius).toBe(
        activeTheme.borderRadii[token]
      );
    });
  });
});
