import { matchers } from '@emotion/jest';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ColorMode } from './ColorMode';
import { skillsoftTheme as theme } from './themes';

expect.extend(matchers);

/* The nearest VariableProvider to a rendered node is the mode that paints it. */
const providers = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('div')).filter((div) =>
    div.className.includes('VariableProvider')
  );

describe('ColorMode with background-current on a generated theme', () => {
  it('sets the parent color for the outer surface', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ColorMode bg="palette-primary-200" mode="light">
          <div data-testid="inner" />
        </ColorMode>
      </ThemeProvider>
    );
    expect(providers(container)[0]).toHaveStyleRule(
      '--color-background-current',
      theme.colors['palette-primary-200']
    );
  });

  it('repeats the parent color on a nested background-current, not a self-reference', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ColorMode bg="palette-primary-200" mode="light">
          <ColorMode bg="background-current" mode="light">
            <div data-testid="inner" />
          </ColorMode>
        </ColorMode>
      </ThemeProvider>
    );
    const [outer, nested] = providers(container);
    expect(outer).toHaveStyleRule(
      '--color-background-current',
      theme.colors['palette-primary-200']
    );
    expect(nested).toHaveStyleRule(
      '--color-background-current',
      theme.colors['palette-primary-200']
    );
  });
});
