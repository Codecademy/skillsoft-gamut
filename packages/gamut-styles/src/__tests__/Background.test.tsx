import { matchers } from '@emotion/jest';
import { ThemeProvider, useTheme } from '@emotion/react';
import { render } from '@testing-library/react';
import { setupRtl as setupRtlBase } from 'component-test-setup';
import overArgs from 'lodash/overArgs';
import type * as React from 'react';

import { Background } from '../Background';
import {
  adminTheme,
  coreTheme as theme,
  lxStudioTheme,
  percipioTheme,
  platformTheme,
} from '../themes';

expect.extend(matchers);

function withThemeProvider<Props>(
  WrappedComponent: React.ComponentType<Props>
) {
  const WithBoundaryComponent: React.FC<Props> = (props) => (
    <ThemeProvider theme={theme}>
      <WrappedComponent {...props} />
    </ThemeProvider>
  );

  return WithBoundaryComponent;
}

const setupRtl = overArgs(
  setupRtlBase,
  withThemeProvider
) as typeof setupRtlBase;

const renderView = setupRtl(Background, {
  children: <div data-testid="content" />,
});

const ActiveMode = () => {
  const { mode } = useTheme();
  return <div>{mode}</div>;
};

describe('Background', () => {
  it('switches the default colormode when contrast standards are not met', () => {
    const { view } = renderView({ bg: 'navy' });
    expect(view.getByTestId('content').parentElement).toHaveStyleRule(
      '--color-background-current',
      theme.colors.navy
    );

    expect(view.getByTestId('content').parentElement).toHaveStyleRule(
      'background-color',
      theme.colors['background-current']
    );
  });

  it('allows for changing the color mode while nested', () => {
    const { view } = renderView({
      bg: 'navy',
      children: (
        <div data-testid="content">
          <Background bg="beige">
            <div data-testid="nested-content" />
          </Background>
        </div>
      ),
    });
    expect(view.getByTestId('content').parentElement).toHaveStyleRule(
      '--color-background-current',
      theme.colors.navy
    );

    expect(view.getByTestId('nested-content').parentElement).toHaveStyleRule(
      '--color-background-current',
      theme.colors.beige
    );
  });

  it('updates the theme context to the current mode', () => {
    const { view } = renderView({
      bg: 'navy',
      children: <ActiveMode />,
    });

    view.getByText('dark');
  });

  it('does not update the theme context when the color mode has not changed', () => {
    const { view } = renderView({
      bg: 'white',
      children: <ActiveMode />,
    });

    view.getByText('light');
  });

  it('it sets the current background color to the specified bg', () => {
    const { view } = renderView({ bg: 'paleBlue' });
    expect(view.getByTestId('content').parentElement).toHaveStyleRule(
      '--color-background-current',
      theme.colors.paleBlue
    );
  });

  it('it sets the current background color to the specified bg when switch modes', () => {
    const { view } = renderView({ bg: 'navy' });
    expect(view.getByTestId('content').parentElement).toHaveStyleRule(
      '--color-background-current',
      theme.colors.navy
    );
  });
});

/*
 * An alias resolves differently in each mode, and Background flips the mode on
 * the same element it paints. It has to paint the palette color the alias has
 * in the outer mode, or `bg="primary"` on core light paints dark mode's yellow.
 */
describe('Background with an alias bg', () => {
  const themes = {
    core: theme,
    admin: adminTheme,
    platform: platformTheme,
    percipio: percipioTheme,
    lxStudio: lxStudioTheme,
  };

  const cases = Object.entries(themes).flatMap(([name, t]) =>
    Object.entries(t.modes).flatMap(([mode, aliases]) =>
      Object.entries(aliases)
        .filter(([, color]) => color in t.colors)
        .map(([alias, color]) => ({ name, t, mode, alias, color }))
    )
  );

  it.each(cases.map((c) => [c.name, c.mode, c.alias, c]))(
    '%s %s: bg="%s" paints its outer-mode color',
    (_name, _mode, _alias, { t, mode, alias, color }) => {
      const { getByTestId } = render(
        <ThemeProvider theme={{ ...t, mode } as typeof theme}>
          <Background bg={alias as any}>
            <div data-testid="content" />
          </Background>
        </ThemeProvider>
      );
      expect(getByTestId('content').parentElement).toHaveStyleRule(
        '--color-background-current',
        t.colors[color as keyof typeof t.colors]
      );
    }
  );
});
