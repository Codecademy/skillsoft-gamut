/*
 * Reusable setup for Vitest browser-mode tests (wire in via `test.setupFiles`).
 * Replaces the old Jest `script/jest/` setup.
 */
import '@testing-library/jest-dom/vitest';

import { afterEach, beforeEach, vi } from 'vitest';

// Pin the clock (as the Jest suite did). Fake `Date` only, so real
// setTimeout/microtasks still drive RTL `waitFor` and `userEvent`.
const FIXED_DATE = new Date(2011, 6, 1);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(FIXED_DATE);
});

afterEach(() => {
  vi.useRealTimers();
});

/*
 * Deliberately not ported from Jest: the `window.scrollTo` stub (real Chromium
 * has it) and the css/asset `moduleNameMapper` (Vite resolves those natively).
 */
