import type { FileMigration } from '../../lib/types';

/*
  Report-only. @skillsoft/gamut ships strict-ESM `.mjs`. With
  `experimental.esmExternals: false`, Next require()s every server
  external, and webpack gives a default import from `.mjs` the whole
  CommonJS module object, `__esModule` or not. `styled('div')` from
  @emotion/styled then throws "is not a function" while Next collects page
  data, and react-select defaults render as "Element type is invalid".
  Dropping the flag can take other config with it (aliases that worked
  around the same thing), so this warns rather than rewriting.
*/

const ESM_EXTERNALS_OFF = /\besmExternals\s*:\s*false\b/;

export const nextConfig: FileMigration = {
  name: 'next-config',
  kind: 'file',
  description:
    "Warn about `esmExternals: false` in next.config, which breaks default imports from gamut's .mjs files.",
  appliesTo: (file) => /(^|\/)next\.config\.[cm]?[jt]s$/.test(file),
  run({ source, warn, note }) {
    if (ESM_EXTERNALS_OFF.test(source)) {
      warn(
        '`experimental.esmExternals: false` makes Next require() server externals, so default imports in gamut\'s .mjs files get a module object and pages fail with "is not a function". Remove it.'
      );
      note('next-esm-externals');
    }
    return null;
  },
};
