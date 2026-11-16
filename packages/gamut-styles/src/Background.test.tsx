import { matchers } from '@emotion/jest';
import { ThemeProvider, useTheme } from '@emotion/react';
import { render } from '@testing-library/react';

import { Background } from './Background';
import { setupRtl } from './testUtils';
import {
  adminTheme,
  coreTheme as theme,
  lxStudioTheme,
  percipioTheme,
  platformTheme,
} from './themes';

expect.extend(matchers);

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
 * A semantic color resolves differently in each mode, and Background flips the
 * mode on the same element it paints. It has to paint the palette color the
 * semantic color has in the outer mode, or `bg="primary"` on core light paints
 * dark mode's yellow.
 */
describe('Background with a semantic color bg', () => {
  const themes = {
    core: theme,
    admin: adminTheme,
    platform: platformTheme,
    percipio: percipioTheme,
    lxStudio: lxStudioTheme,
  };

  const cases = Object.entries(themes).flatMap(([name, t]) =>
    Object.entries(t.modes).flatMap(([mode, semanticColors]) =>
      Object.entries(semanticColors)
        .filter(([, color]) => color in t.colors)
        .map(([semanticColor, color]) => ({
          name,
          t,
          mode,
          semanticColor,
          color,
        }))
    )
  );

  it.each(cases.map((c) => [c.name, c.mode, c.semanticColor, c]))(
    '%s %s: bg="%s" paints its outer-mode color',
    (_name, _mode, _semanticColor, { t, mode, semanticColor, color }) => {
      const { getByTestId } = render(
        <ThemeProvider theme={{ ...t, mode } as typeof theme}>
          <Background bg={semanticColor as any}>
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
