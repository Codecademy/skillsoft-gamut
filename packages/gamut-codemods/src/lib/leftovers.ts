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
const TEXT_EXT =
  /\.(m?[jt]sx?|c[jt]s|json|ya?ml|md|mdx|html|scss|css)$|(^|\/)\.eslintrc$/;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/*
  Old names, not already followed by a longer package name, and not the
  tail of a new one (`@skillsoft/eslint-plugin-gamut` contains
  `eslint-plugin-gamut`).

  A `/dist` path into one of the packages this repo publishes also counts,
  even outside files the parser reads (docs, JSON, Flow). Only the packages
  in manifest.packages are checked. Removed and unrelated `@codecademy`
  packages aren't ours to rewrite.
*/
const oldNamesPattern = (manifest: Manifest) => {
  const published = Object.keys(manifest.packages);
  const names = [...published, ...Object.keys(manifest.removedPackages)]
    .sort((a, b) => b.length - a.length)
    .map(escape);
  const dist = published.map(escape).join('|');
  const prefix = escape(manifest.eslintPlugin.from);
  return new RegExp(
    `(?<![\\w@/-])(?:${names.join(
      '|'
    )})(?![\\w-])|plugin:${prefix}/|["'\`]${prefix}/|(?<![\\w@/-])(?:${dist})/dist(?![\\w-])`
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
}

export const findLeftovers = (roots: string[], manifest: Manifest) => {
  const pattern = oldNamesPattern(manifest);
  const hits: Leftover[] = [];
  for (const root of roots) {
    const files = fs.statSync(root).isDirectory() ? walk(root) : [root];
    for (const file of files) {
      if (SKIP_FILES.test(file) || !TEXT_EXT.test(file)) continue;
      fs.readFileSync(file, 'utf8')
        .split('\n')
        .forEach((text, i) => {
          if (pattern.test(text))
            hits.push({ file, line: i + 1, text: text.trim() });
        });
    }
  }
  return hits;
};
