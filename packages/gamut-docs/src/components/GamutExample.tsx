/**
 * A Storybook-style canvas for rendering live Gamut components on a page.
 * Rendered on the server with no client directive, so examples ship as static
 * HTML plus Emotion's CSS — enough for anything driven purely by CSS, like
 * media and container queries.
 *
 * `GamutProvider` isn't used here: it always injects Gamut's global reset and
 * typography, which would restyle the surrounding Starlight page. Instead the
 * Core theme goes through Emotion's `ThemeProvider`, and the theme's CSS
 * variables (the `--color-*` values Gamut's color props compile to) are set on
 * this wrapper only, in light mode, matching Storybook's default canvas.
 */
import { ThemeProvider } from '@emotion/react';
import { coreTheme } from '@skillsoft/gamut-styles';
import type { CSSProperties, ReactNode } from 'react';

// Only flat custom properties can go in an inline style; the theme also nests
// some per-breakpoint variables under media query keys, which are skipped.
const variables = Object.fromEntries(
  Object.values(coreTheme._variables)
    .flatMap((scope) => Object.entries(scope))
    .filter(
      ([key, value]) =>
        key.startsWith('--') &&
        (typeof value === 'string' || typeof value === 'number')
    )
);

const canvasStyle = {
  ...variables,
  background: 'var(--color-background)',
  color: 'var(--color-text)',
  border: '1px solid var(--sl-color-gray-5)',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  margin: '1rem 0',
} as CSSProperties;

export const GamutExample = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={coreTheme}>
    <div className="not-content" style={canvasStyle}>
      {children}
    </div>
  </ThemeProvider>
);
