import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { configDefaults, defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storybookDir = join(__dirname, 'packages/.storybook');

/*
 * Vitest browser-mode config for running stories as tests. The storybookTest
 * plugin reads packages/.storybook/main.ts (framework, viteFinal → emotion
 * transform, aliases, process.env define) and turns each story into a test
 * case; it also auto-applies the preview.ts decorators/globals (Storybook
 * 10.3+). Lives at the repo root because the plugin resolves story globs
 * relative to the workspace root.
 */
export default defineConfig({
  /*
   * The storybookTest plugin forces the Vite root to `<configDir>/..`
   * (packages) but resolves story-glob paths relative to this `root` (falling
   * back to cwd). Set them to the same dir so the generated test `include`
   * matches — otherwise Vitest finds no test files.
   */
  root: join(__dirname, 'packages'),
  plugins: [
    storybookTest({
      configDir: storybookDir,
    }),
  ],
  test: {
    name: 'storybook',
    // Reusable browser-mode setup: jest-dom matchers + deterministic Date.
    setupFiles: [join(__dirname, 'script/vitest/setup.ts')],
    // The stories globs in main.ts include `.mdx` docs pages (needed by
    // Storybook), but those have no runnable stories and just show up as noisy
    // skipped "(0 test)" entries. Drop them from test collection.
    exclude: [...configDefaults.exclude, '**/*.mdx'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
  /*
   * Pre-bundle Emotion so Vitest doesn't discover it mid-run and force a reload
   * (which aborts the browser test runner on a cold cache). gamut-styles is
   * aliased to source, so its Emotion imports aren't caught by default scanning.
   * Storybook/Vitest run in development mode, so the JSX transform emits the
   * *dev* runtime (`jsx-dev-runtime`); include it too, or a cold cache discovers
   * it mid-run and reloads (was flaking DatePicker/SelectDropdown/Modal in CI).
   */
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/react/jsx-runtime',
      '@emotion/react/jsx-dev-runtime',
      '@emotion/styled',
      '@emotion/styled/base',
    ],
  },
});
