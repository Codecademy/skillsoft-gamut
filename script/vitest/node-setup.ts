/*
 * Setup for the Vitest `node` project (jsdom). Ports `script/jest/base-setup.js`
 * and `script/jest/rtl-setup.js` for the packages that have moved off Jest.
 */
import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// RTL only auto-registers cleanup when `afterEach` is a global; tests import it from vitest.
afterEach(cleanup);

/*
 * Pin `Date.now` (as the Jest suite did). Patching the real `Date` rather than
 * faking timers means a test's own `vi.useFakeTimers()`/`useRealTimers()` can't undo it.
 */
const FIXED_NOW = new Date(2011, 6, 1).valueOf();
Date.now = () => FIXED_NOW;

// jsdom doesn't implement `scrollTo`.
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });

/*
 * jsdom doesn't implement `matchMedia`, but Vitest's jsdom environment still
 * defines the key (as `undefined`), which defeats `'matchMedia' in window`
 * guards like `usePrefersDarkMode`'s. Drop it so they behave as under Jest.
 */
if (typeof window.matchMedia !== 'function') {
  delete (window as Partial<Window>).matchMedia;
}
