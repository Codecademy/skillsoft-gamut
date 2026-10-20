import type { FileMigration } from '../../lib/types';

/*
  Legacy .eslintrc / .eslintrc.json only. These are often JSONC (mono's
  have comments), so this is a targeted text rewrite rather than
  JSON.parse. JS and flat configs are left alone: in a flat config the rule
  prefix is whatever key the plugin is registered under, so blindly
  renaming rule keys would break it. The leftovers report lists them.
*/

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const eslintConfig: FileMigration = {
  name: 'eslint-config',
  kind: 'file',
  description:
    'Update the plugin name, `plugin:` extends, and rule prefix in .eslintrc(.json).',
  match: (file) => /(^|\/)\.eslintrc(\.json)?$/.test(file),
  run({ source, manifest }) {
    const { from, to } = manifest.eslintPlugin;
    const old = escape(from);
    const next = source
      .replace(new RegExp(`"plugin:${old}/`, 'g'), `"plugin:${to}/`)
      .replace(new RegExp(`"${old}/`, 'g'), `"${to}/`)
      .replace(new RegExp(`"(eslint-plugin-)?${old}"`, 'g'), `"${to}"`);
    return next === source ? null : next;
  },
};
