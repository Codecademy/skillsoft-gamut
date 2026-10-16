import fs from 'node:fs';
import path from 'node:path';

import type { Manifest } from './manifest';

/*
  After the migrations run, anything still naming an old package is for a
  person: jest moduleNameMapper regexes, tsconfig paths, flat ESLint
  configs, comments, docs. This lists them as file:line.
*/

export const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.next',
  '.nx',
  'tmp',
]);
const SKIP_FILES =
  /(^|\/)(yarn\.lock|package-lock\.json|pnpm-lock\.yaml|CHANGELOG\.md)$/;
/* .mdc is Cursor rules; .code-snippets is VS Code snippets (JSONC). */
const TEXT_EXT =
  /\.(m?[jt]sx?|c[jt]s|json|ya?ml|md|mdx|mdc|html|scss|css|code-snippets)$|(^|\/)\.eslintrc$/;

/* Extensionless executables, like tools/script/sync-gamut-deps. */
const isScript = (file: string) => {
  if (path.basename(file).includes('.')) return false;
  const fd = fs.openSync(file, 'r');
  try {
    const head = Buffer.alloc(2);
    fs.readSync(fd, head, 0, 2, 0);
    return head.toString() === '#!';
  } finally {
    fs.closeSync(fd);
  }
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/*
  Old names, not already followed by a longer package name, and not the
  tail of a new one (`@skillsoft/eslint-plugin-gamut` contains
  `eslint-plugin-gamut`).

  A `/dist` path into one of the packages this repo publishes also counts,
  even outside files the parser reads (docs, JSON, Flow). Only the packages
  in manifest.packages are checked. Removed and unrelated `@codecademy`
  packages aren't ours to rewrite.

  Quoted `gamut/` rule keys and `plugin:gamut/` only count when
  eslintRuleKeys is set. In a flat config they're correct as written.
*/
const oldNamesPattern = (manifest: Manifest, eslintRuleKeys: boolean) => {
  const published = Object.keys(manifest.packages);
  const names = [...published, ...Object.keys(manifest.removedPackages)]
    .sort((a, b) => b.length - a.length)
    .map(escape);
  const dist = published.map(escape).join('|');
  const prefix = escape(manifest.eslintPlugin.from);
  const ruleKeys = eslintRuleKeys ? `|plugin:${prefix}/|["'\`]${prefix}/` : '';
  return new RegExp(
    `(?<![\\w@/-])(?:${names.join(
      '|'
    )})(?![\\w-])${ruleKeys}|(?<![\\w@/-])(?:${dist})/dist(?![\\w-])`
  );
};

export function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(path.join(dir, entry.name));
    } else {
      yield path.join(dir, entry.name);
    }
  }
}

export interface Leftover {
  file: string;
  line: number;
  text: string;
  /* Why the line is listed, when the old name alone doesn't explain it. */
  note?: string;
}

/*
  Under a flat config the directive prefix is the plugins key. Older builds
  of this codemod rewrote `gamut/` directives to `@skillsoft/gamut/` anyway.
  Unless some file registers the plugin under that key, those directives
  name a rule that doesn't exist and stop suppressing the real one.
*/
const scopedDirectivePattern = (manifest: Manifest) =>
  new RegExp(
    `eslint-(?:disable|enable)\\S*\\s.*(?<![\\w-])${escape(
      manifest.eslintPlugin.to
    )}/`
  );
const registersScopedKey = (manifest: Manifest) =>
  new RegExp(`["'\`]${escape(manifest.eslintPlugin.to)}["'\`]\\s*:`);

export const findLeftovers = (
  roots: string[],
  manifest: Manifest,
  { eslintRuleKeys = true }: { eslintRuleKeys?: boolean } = {}
) => {
  const pattern = oldNamesPattern(manifest, eslintRuleKeys);
  const scopedDirective = scopedDirectivePattern(manifest);
  const registersKey = registersScopedKey(manifest);
  const hits: Leftover[] = [];
  const directives: Leftover[] = [];
  let keyRegistered = false;
  for (const root of roots) {
    const files = fs.statSync(root).isDirectory() ? walk(root) : [root];
    for (const file of files) {
      if (SKIP_FILES.test(file)) continue;
      if (!TEXT_EXT.test(file) && !isScript(file)) continue;
      fs.readFileSync(file, 'utf8')
        .split('\n')
        .forEach((text, i) => {
          if (pattern.test(text))
            hits.push({ file, line: i + 1, text: text.trim() });
          if (eslintRuleKeys) return;
          if (registersKey.test(text)) keyRegistered = true;
          if (scopedDirective.test(text))
            directives.push({
              file,
              line: i + 1,
              text: text.trim(),
              note: `no flat config registers the plugin as '${manifest.eslintPlugin.to}'; use its plugins key, e.g. ${manifest.eslintPlugin.from}/`,
            });
        });
    }
  }
  return keyRegistered ? hits : [...hits, ...directives];
};
