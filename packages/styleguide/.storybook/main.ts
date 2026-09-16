// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import type { StorybookConfig } from '@storybook/react-webpack5';
import { resolve, dirname, join } from 'node:path';

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
    getAbsolutePath('@storybook/addon-webpack5-compiler-babel'),
    // the @nx/react storybook plugin is just a subdirectory of the @nx/react package
    // so getting the absolute path of the package.json won't work. they do expose
    // a require export though, so we can just use that directly
    require.resolve('@nx/react/plugins/storybook'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-designs'),
    getAbsolutePath('storybook-addon-deep-controls'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {
      builder: {},
    },
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

  webpackFinal(config) {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '~styleguide/blocks': resolve(__dirname, './components/'),
        '~styleguide/argTypes': resolve(__dirname, './argTypes/'),
        '@skillsoft/gamut-styles$': resolve(
          __dirname,
          '../../gamut-styles/src'
        ),
        '@skillsoft/gamut$': resolve(__dirname, '../../gamut/src'),
        '@skillsoft/gamut-illustrations$': resolve(
          __dirname,
          '../../gamut-illustrations/src'
        ),
        '@skillsoft/gamut-icons$': resolve(__dirname, '../../gamut-icons/src'),
        '@skillsoft/gamut-patterns$': resolve(
          __dirname,
          '../../gamut-patterns/src'
        ),
        '@skillsoft/variance$': resolve(__dirname, '../../variance/src'),
        // The bare-specifier aliases above only cover each package's public
        // surface (their src/index). These four docs-only pages reach past
        // that into groupings with no public export (icon categories, raw
        // typography variant metadata, the full system-props registry) — the
        // source's own `@skillsoft/gamut/import-paths` eslint rule already
        // flags each of these sites with an acknowledged disable comment.
        // Resolving them here, rather than adding them to any package's
        // `exports` map, keeps that map an honest description of the
        // published surface instead of growing it to fit docs tooling.
        '@skillsoft/gamut-icons/src/icons/mini$': resolve(
          __dirname,
          '../../gamut-icons/src/icons/mini'
        ),
        '@skillsoft/gamut-icons/src/icons/regular$': resolve(
          __dirname,
          '../../gamut-icons/src/icons/regular'
        ),
        '@skillsoft/gamut/src/Typography/variants$': resolve(
          __dirname,
          '../../gamut/src/Typography/variants'
        ),
        '@skillsoft/gamut-styles/src/variance/config$': resolve(
          __dirname,
          '../../gamut-styles/src/variance/config'
        ),
      },
    };
    config.infrastructureLogging = {
      level: 'warn',
    };
    return config;
  },
};

export default config;

function getAbsolutePath(value: string, root = 'package.json'): string {
  return dirname(require.resolve(join(value, root)));
}
