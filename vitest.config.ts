import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react-swc';
import { configDefaults, defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storybookDir = join(__dirname, 'packages/.storybook');
const outputDirectory = join(__dirname, 'coverage/vitest');

/*
 * One Vitest workspace. `storybook` runs stories as browser tests; the
 * node-side projects run every other test: `jsdom` for component, hook, and
 * style packages, and `node` for Node tooling (ESLint rules, codemods, CLIs).
 * Select one with `--project=<name>`.
 */
export default defineConfig({
  test: {
    // Coverage and reporters are workspace-wide; Vitest doesn't allow them per project.
    coverage: {
      provider: 'v8',
      reportsDirectory: outputDirectory,
      reporter: process.env.CI
        ? ['clover', 'json', 'lcov', 'text']
        : ['html', 'text'],
      include: ['packages/**'],
      exclude: [
        ...configDefaults.coverage.exclude!,
        '**/dist/**',
        'packages/gamut-icons/src/icons/**',
        'packages/gamut-patterns/src/patterns/**',
      ],
      // Match Jest: only report files the tests load.
      all: false,
    },
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: join(outputDirectory, 'junit.xml') },
    projects: [
      {
        /*
         * Vitest browser-mode config for running stories as tests. The
         * storybookTest plugin reads packages/.storybook/main.ts (framework,
         * viteFinal → emotion transform, aliases, process.env define) and turns
         * each story into a test case; it also auto-applies the preview.ts
         * decorators/globals (Storybook 10.3+).
         *
         * The plugin forces the Vite root to `<configDir>/..` (packages) but
         * resolves story-glob paths relative to this `root` (falling back to
         * cwd). Set them to the same dir so the generated test `include`
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
          // Storybook), but those have no runnable stories and just show up as
          // noisy skipped "(0 test)" entries. Drop them from test collection.
          exclude: [...configDefaults.exclude, '**/*.mdx'],
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
        /*
         * Pre-bundle Emotion so Vitest doesn't discover it mid-run and force a
         * reload (which aborts the browser test runner on a cold cache).
         * gamut-styles is aliased to source, so its Emotion imports aren't
         * caught by default scanning. Storybook/Vitest run in development
         * mode, so the JSX transform emits the *dev* runtime
         * (`jsx-dev-runtime`); include it too, or a cold cache discovers it
         * mid-run and reloads (was flaking DatePicker/SelectDropdown/Modal in
         * CI).
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
      },
      {
        root: __dirname,
        // Same Emotion transform as Storybook, so component selectors and labels work.
        plugins: [
          react({
            plugins: [
              [
                '@swc/plugin-emotion',
                {
                  sourceMap: true,
                  autoLabel: 'always',
                  labelFormat: '[local]',
                },
              ],
            ],
          }),
        ],
        test: {
          name: 'jsdom',
          include: [
            'packages/{gamut,gamut-styles,gamut-icons,gamut-illustrations,gamut-patterns,variance,macros}/**/*.test.{js,ts,tsx}',
          ],
          exclude: [...configDefaults.exclude, '**/dist/**'],
          environment: 'jsdom',
          setupFiles: [join(__dirname, 'script/vitest/jsdom-setup.ts')],
          clearMocks: true,
        },
      },
      {
        root: __dirname,
        test: {
          name: 'node',
          include: [
            'packages/{eslint-plugin-gamut,gamut-codemods}/**/*.test.ts',
            'packages/gamut-agent-tools/**/*.test.mjs',
          ],
          // Codemod fixtures are inputs, not tests, and may be deliberately odd code.
          exclude: [
            ...configDefaults.exclude,
            '**/dist/**',
            '**/__testfixtures__/**',
          ],
          environment: 'node',
          setupFiles: [join(__dirname, 'script/vitest/node-setup.ts')],
          clearMocks: true,
        },
      },
    ],
  },
});
