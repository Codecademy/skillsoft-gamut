import { matchers } from '@emotion/jest';
import { setupRtl } from '@skillsoft/gamut-tests';

import { Tag } from '..';

expect.extend(matchers);

const renderView = setupRtl(Tag, { children: 'Python' });

/* The element that carries the tag's fill: the wrapper around its label. */
const fillOf = (label: HTMLElement) =>
  label.closest('a, button, span')!.parentElement!;

describe('Tag', () => {
  it.each(['navigation', 'suggestion'] as const)(
    'gives a %s tag no fill of its own',
    (variant) => {
      const { view } = renderView({ variant, href: '#' });

      expect(fillOf(view.getByText('Python'))).toHaveStyleRule(
        'background-color',
        'transparent'
      );
    }
  );

  it('keeps the selection chip filled at rest', () => {
    const { view } = renderView({ variant: 'selection' });

    expect(fillOf(view.getByText('Python'))).toHaveStyleRule(
      'background-color',
      'var(--colors-text-subtle)'
    );
  });

  it('gives a disabled selection tag no fill and the disabled ink', () => {
    const { view } = renderView({ variant: 'selection', disabled: true });

    const fill = fillOf(view.getByText('Python'));
    expect(fill).toHaveStyleRule('background-color', 'transparent');
    expect(fill).toHaveStyleRule('color', 'var(--colors-action-disabled)');
    expect(
      view.getByRole('button', { name: 'Dismiss Python Tag' })
    ).not.toHaveStyleRule('background-color', 'var(--colors-action-disabled)', {
      target: ':disabled',
    });
  });

  it('gives a disabled navigation tag no fill', () => {
    const { view } = renderView({
      variant: 'navigation',
      disabled: true,
      href: '#',
    });

    expect(view.getByText('Python').closest('a, button')).not.toHaveStyleRule(
      'background-color',
      'var(--colors-action-disabled)',
      { target: ':disabled' }
    );
  });
});
