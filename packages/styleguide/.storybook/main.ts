import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/*
* `@vitejs/plugin-react-swc`, `@swc/plugin-emotion`, and the `@swc/core`
* resolution below are pinned to versions from the same release window
* (June-July 2026) on purpose, not left behind by accident. Newer
* `@swc/plugin-emotion`/`@swc/core` pairs (as of Sept 2026) crash with an
* opaque WASM panic on real story/mdx files due to an undocumented ABI
* mismatch between the plugin and swc_core - see the "storybook swc emotion
* spike" notes for the repro. Bump these three together, not individually.
*/

import react from '@vitejs/plugin-react-swc';
import type { StorybookConfig } from '@storybook/react-vite';
import type { Alias, AliasOptions } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: [
    '../src/lib/**/*.@(mdx)',
    '../src/lib/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  staticDirs: ['../src/static'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-designs'),
    getAbsolutePath('storybook-addon-deep-controls'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      skipChildrenPropWithoutDoc: false,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        if (prop.parent && /node_modules/.test(prop.parent.fileName)) {
          return false;
        }
        if (['mode', 'theme'].includes(prop.name)) {
          return false;
        }
        return true;
      },
    },
  },

  viteFinal(config, { configType }) {
    /*
     * Storybook's react-vite framework transpiles JSX with esbuild and does not
     * add a react plugin. We add @vitejs/plugin-react-swc ourselves so
     * Emotion's swc plugin runs, reproducing the webpack setup's `.babelrc.json`
     * transform (autoLabel + source maps for stable, readable Emotion class
     * names).
     */
    config.plugins = [
      ...(config.plugins ?? []),
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
    ];

    /*
     * `@emotion/babel-plugin` skips stamping `target` when the source already
     * passes one (see BarChart/BarRow/elements.tsx); `@swc/plugin-emotion`
     * stamps it unconditionally, so the transformed output has the key twice
     * and esbuild flags it. Duplicate keys written by hand are still caught
     * upstream by TypeScript and eslint's `no-dupe-keys`, so the only ones
     * reaching esbuild here are the plugin's.
     */
    if (config.esbuild !== false) {
      config.esbuild = {
        ...config.esbuild,
        logOverride: {
          ...config.esbuild?.logOverride,
          'duplicate-object-key': 'silent',
        },
      };
    }

    /*
     * Reproduce the webpack `resolve.alias` map. The `$`-suffixed webpack
     * aliases matched the bare package specifier only, so we use anchored
     * regexes to avoid rewriting subpaths (e.g. `@skillsoft/gamut-styles/src`).
     * Aliases are prepended so they win over anything Vite/Storybook set.
     */
    config.resolve = {
      ...config.resolve,
      alias: [
        { find: '~styleguide/blocks', replacement: resolve(__dirname, './components') },
        { find: '~styleguide/argTypes', replacement: resolve(__dirname, './argTypes') },
        { find: /^@skillsoft\/gamut-styles$/, replacement: resolve(__dirname, '../../gamut-styles/src') },
        { find: /^@skillsoft\/gamut$/, replacement: resolve(__dirname, '../../gamut/src') },
        { find: /^@skillsoft\/gamut-illustrations$/, replacement: resolve(__dirname, '../../gamut-illustrations/src') },
        { find: /^@skillsoft\/gamut-icons$/, replacement: resolve(__dirname, '../../gamut-icons/src') },
        { find: /^@skillsoft\/gamut-patterns$/, replacement: resolve(__dirname, '../../gamut-patterns/src') },
        { find: /^@skillsoft\/variance$/, replacement: resolve(__dirname, '../../variance/src') },
        // The bare-specifier aliases above only cover each package's public
        // surface (their src/index). These four docs-only pages reach past
        // that into groupings with no public export (icon categories, raw
        // typography variant metadata, the full system-props registry) — the
        // source's own `@skillsoft/gamut/import-paths` eslint rule already
        // flags each of these sites with an acknowledged disable comment.
        // Resolving them here, rather than adding them to any package's
        // `exports` map, keeps that map an honest description of the
        // published surface instead of growing it to fit docs tooling.
        { find: /^@skillsoft\/gamut-icons\/src\/icons\/mini$/, replacement: resolve(__dirname, '../../gamut-icons/src/icons/mini') },
        { find: /^@skillsoft\/gamut-icons\/src\/icons\/regular$/, replacement: resolve(__dirname, '../../gamut-icons/src/icons/regular') },
        { find: /^@skillsoft\/gamut\/src\/Typography\/variants$/, replacement: resolve(__dirname, '../../gamut/src/Typography/variants') },
        { find: /^@skillsoft\/gamut-styles\/src\/variance\/config$/, replacement: resolve(__dirname, '../../gamut-styles/src/variance/config') },
        ...normalizeAlias(config.resolve?.alias),
      ],
    };

    /*
     * Some source (e.g. the theme provider decorator) branches on
     * `process.env.NODE_ENV`; webpack's DefinePlugin supplied it. Vite only
     * guarantees it during dep pre-bundling, so define it for browser code too.
     */
    config.define = {
      ...config.define,
      'process.env.NODE_ENV': JSON.stringify(
        configType === 'PRODUCTION' ? 'production' : 'development'
      ),
    };

    return config;
  },
};

export default config;

function getAbsolutePath(value: string, root = 'package.json'): string {
  return dirname(require.resolve(join(value, root)));
}

/* Vite accepts alias as either an object map or an array of {find, replacement}. */
function normalizeAlias(alias: AliasOptions | undefined): Alias[] {
  if (!alias) return [];
  if (Array.isArray(alias)) return alias;
  return Object.entries(alias).map(([find, replacement]) => ({
    find,
    replacement,
  }));
}
