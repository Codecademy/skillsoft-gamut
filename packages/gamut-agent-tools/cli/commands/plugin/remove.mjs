import { rm, stat } from 'node:fs/promises';

import { claudePluginSpec, marketplaceName } from '../../lib/claude.mjs';
import { cursorDestPath } from '../../lib/cursor.mjs';
import { log, warn } from '../../lib/io.mjs';
import { runCommand } from '../../lib/run-command.mjs';
import { resolveSourceRoot } from '../../lib/source-root.mjs';
import { TARGETS } from './install.mjs';

// ---------------------------------------------------------------------------

/** @param {string} sourceRoot */
async function removeCursor(sourceRoot) {
  const dest = await cursorDestPath(sourceRoot);
  const st = await stat(dest).catch(() => null);

  if (!st) {
    log(`Cursor: nothing to remove — ${dest} does not exist.`);
    return;
  }

  await rm(dest, { recursive: true, force: true });
  log(`Cursor: removed ${dest}`);
}

/** @param {string} sourceRoot */
async function removeClaude(sourceRoot) {
  const spec = await claudePluginSpec(sourceRoot);
  const mpName = marketplaceName(spec);
  const pluginName = spec.split('@')[0];

  let code = await runCommand('claude', [
    'plugin',
    'remove',
    pluginName,
    '--scope',
    'user',
  ]);
  if (code !== 0) {
    warn(
      `warning: "claude plugin remove" exited ${code} — the plugin may not have been installed.`
    );
  } else {
    log(`Claude Code: removed plugin "${pluginName}"`);
  }

  code = await runCommand('claude', [
    'plugin',
    'marketplace',
    'remove',
    mpName,
  ]);
  if (code !== 0) {
    warn(
      `warning: "claude plugin marketplace remove" exited ${code} — ` +
        `the marketplace entry may not exist or the command syntax may differ. ` +
        `Run "claude plugin marketplace list" to check.`
    );
  } else {
    log(`Claude Code: removed marketplace "${mpName}"`);
  }
}

// ---------------------------------------------------------------------------

/**
 * gamut plugin remove [cursor|claude] [--plugin-dir <path>]
 *
 * @param {string[]} args
 */
export default async function remove(args) {
  const target = args.find((a) => !a.startsWith('-')) ?? 'cursor';

  if (!TARGETS.includes(target)) {
    throw new Error(
      `Unknown target: "${target}". Choose from: ${TARGETS.join(', ')}`
    );
  }

  const sourceRoot = await resolveSourceRoot(args);

  if (target === 'cursor') {
    await removeCursor(sourceRoot);
  } else if (target === 'claude') {
    await removeClaude(sourceRoot);
  }
}
