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
import type { CSSObject } from '@emotion/react';
import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { coreTheme } from '@skillsoft/gamut-styles';
import type { ReactNode } from 'react';

// Each scope of theme variables (the palette, then the color mode aliases) is
// its own style object, so Emotion merges any per-breakpoint variables they
// nest under media query keys instead of one overwriting the other.
const Canvas = styled.div(
  ...(Object.values(coreTheme._variables) as CSSObject[]),
  {
    background: 'var(--color-background)',
    color: 'var(--color-text)',
    border: '1px solid var(--sl-color-gray-5)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    margin: '1rem 0',
  }
);

export const GamutExample = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={coreTheme}>
    <Canvas className="not-content">{children}</Canvas>
  </ThemeProvider>
);
