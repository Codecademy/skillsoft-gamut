import { stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// This file lives at <package-root>/cli/lib/source-root.mjs, so the
// package root (where skills/, rules/, DESIGN.*.md, .claude-plugin/, and
// .cursor-plugin/ live) is two directories up.
const PACKAGE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);

/**
 * Returns this package's own root, or the value of --plugin-dir if provided.
 *
 * Unlike the old cross-package resolvePluginDir, this never needs to check
 * whether @skillsoft/gamut-agent-tools is installed — if this code is
 * running at all, it already is.
 *
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function resolveSourceRoot(args) {
  const override = getFlag(args, '--plugin-dir');
  if (!override) {
    return PACKAGE_ROOT;
  }
  const abs = resolve(override);
  const st = await stat(abs).catch(() => null);
  if (!st?.isDirectory()) {
    throw new Error(`--plugin-dir path not found: ${abs}`);
  }
  return abs;
}

/**
 * @param {string[]} argv
 * @param {string} flag
 * @param {string} [fallback]
 * @returns {string | undefined}
 */
export function getFlag(argv, flag, fallback) {
  const idx = argv.indexOf(flag);
  return idx !== -1 ? argv[idx + 1] : fallback;
}
