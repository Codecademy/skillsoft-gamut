/*
 * Setup for the Vitest `jsdom` project, ported from the old Jest setup:
 * jest-dom and Emotion matchers, RTL cleanup, and jsdom gaps.
 */
import '@testing-library/jest-dom/vitest';

import { matchers as emotionMatchers } from '@emotion/jest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// `toHaveStyleRule`. @emotion/jest types its matchers for Jest's `expect`, hence the cast.
expect.extend(
  emotionMatchers as unknown as Parameters<typeof expect.extend>[0]
);

// RTL only auto-registers cleanup when `afterEach` is a global; tests import it from vitest.
afterEach(cleanup);

/*
 * jsdom doesn't implement `matchMedia`, but Vitest's jsdom environment still
 * defines the key (as `undefined`), which defeats `'matchMedia' in window`
 * guards like `usePrefersDarkMode`'s. Drop it so they behave as under Jest.
 */
if (typeof window.matchMedia !== 'function') {
  delete (window as Partial<Window>).matchMedia;
}
