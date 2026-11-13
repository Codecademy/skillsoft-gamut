/*
 * Setup for the Vitest `storybook` (browser) project: jest-dom matchers and
 * instant framer-motion animations. Wired in via `test.setupFiles`.
 */
import '@testing-library/jest-dom/vitest';

import { MotionGlobalConfig } from 'framer-motion';

/*
 * Resolve framer-motion animations instantly so a11y checks (axe, via
 * addon-a11y) run against the settled final state. Stories animate content in
 * with an opacity fade (FadeInSlideOut, the icon/illustration ImageGallery);
 * if axe measures an element mid-fade (opacity < 1), dark text reads as light
 * gray against white and it reports a false color-contrast failure. This was
 * the flaky, machine-dependent failure on Toaster and the icon galleries.
 */
MotionGlobalConfig.skipAnimations = true;
