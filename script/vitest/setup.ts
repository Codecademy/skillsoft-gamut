/*
 * Reusable setup for Vitest browser-mode tests (wire in via `test.setupFiles`).
 * Replaces the old Jest `script/jest/` setup.
 */
import '@testing-library/jest-dom/vitest';

import { MotionGlobalConfig } from 'framer-motion';
import { afterEach, beforeEach, vi } from 'vitest';

/*
 * Resolve framer-motion animations instantly so a11y checks (axe, via
 * addon-a11y) run against the settled final state. Stories animate content in
 * with an opacity fade (FadeInSlideOut, the icon/illustration ImageGallery);
 * if axe measures an element mid-fade (opacity < 1), dark text reads as light
 * gray against white and it reports a false color-contrast failure. This was
 * the flaky, machine-dependent failure on Toaster and the icon galleries.
 */
MotionGlobalConfig.skipAnimations = true;

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
