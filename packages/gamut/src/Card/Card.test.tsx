import { matchers } from '@emotion/jest';
import { theme } from '@skillsoft/gamut-styles';
import { MockGamutProvider, setupRtl } from '@skillsoft/gamut-tests';
import { renderHook } from '@testing-library/react';

import { Card } from '.';
import { useCardElevation } from './styles';

expect.extend(matchers);

const renderCard = setupRtl(Card, { children: 'Card content' });

const renderElevation = (...args: Parameters<typeof useCardElevation>) =>
  renderHook(() => useCardElevation(...args), {
    wrapper: MockGamutProvider,
  }).result.current;

describe('useCardElevation', () => {
  it('maps the theme elevation tokens onto the motion variants', () => {
    const { animate, initial } = renderElevation('none');

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
    const { animate } = renderElevation('patternRight');

    expect(animate).toMatchObject({
      boxShadow: theme.elevation['hoverMirrored-shadow'],
      transform: theme.elevation['hoverMirrored-transform'],
    });
  });

  it('applies outline shadows but shares the elevation transforms', () => {
    const { animateOutline, initialOutline } = renderElevation('outline');

    expect(initialOutline.boxShadow).not.toBe(theme.elevation['rest-shadow']);
    expect(initialOutline.transform).toBe(theme.elevation['rest-transform']);
    expect(animateOutline.boxShadow).not.toBe(theme.elevation['hover-shadow']);
    expect(animateOutline.transform).toBe(theme.elevation['hover-transform']);
  });

  it('passes borderRadius through to every variant', () => {
    const variants = renderElevation('none', '8px');

    Object.values(variants).forEach((variant) => {
      expect(variant.borderRadius).toBe('8px');
    });
  });

  /* Design's card map: only an interactive card has a shadow. */
  it('gives a card that is not interactive no shadow at rest', () => {
    const { initial } = renderElevation('none', undefined, false);

    expect(initial.boxShadow).toBe('none');
  });
});

describe('Card', () => {
  const cardEl = (view: ReturnType<typeof renderCard>['view']) =>
    view.getByText('Card content');

  /*
   * Design's card map, Interactive: a `state-hover` veil and
   * the raised-hover shadow; the border stays `border-subtle`.
   */
  it.each(['default', 'brand'] as const)(
    'veils an interactive %s card on hover without changing its border',
    (variant) => {
      const { view } = renderCard({ isInteractive: true, variant });

      expect(cardEl(view)).toHaveStyleRule(
        'background-color',
        theme.colors['state-hover'],
        { target: /:hover>.+::after$/ }
      );
      expect(cardEl(view)).not.toHaveStyleRule('border-color', /.*/, {
        target: ':hover>',
      });
      expect(cardEl(view)).toHaveStyleRule(
        'border-color',
        theme.colors['border-subtle']
      );
    }
  );

  it('does not veil a card that is not interactive', () => {
    const { view } = renderCard();

    expect(cardEl(view)).not.toHaveStyleRule(
      'background-color',
      theme.colors['state-hover'],
      { target: /:hover>.+::after$/ }
    );
  });
});
