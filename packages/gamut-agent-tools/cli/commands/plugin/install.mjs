import { cp, mkdir, readdir, rm, symlink } from 'node:fs/promises';
import { resolve } from 'node:path';

import { claudePluginSpec, marketplaceName } from '../../lib/claude.mjs';
import { cursorDestPath } from '../../lib/cursor.mjs';
import {
  installDesignMd,
  listCanonicalThemes,
  resolveTheme,
} from '../../lib/design.mjs';
import { log, warn } from '../../lib/io.mjs';
import { runCommand } from '../../lib/run-command.mjs';
import { getFlag, resolveSourceRoot } from '../../lib/source-root.mjs';

export const TARGETS = ['cursor', 'claude'];
export const SCOPES = ['all', 'skills', 'rules', 'agents'];

// ---------------------------------------------------------------------------

/** Directories in the plugin source that should not be installed to Cursor. */
const CURSOR_IGNORE = new Set([
  '.claude-plugin', // Claude Code manifest — not a Cursor concept
]);

/** @param {string} sourceRoot @param {string} scope */
async function installCursor(sourceRoot, scope) {
  const dest = await cursorDestPath(sourceRoot);

  if ((process.env.CURSOR_INSTALL_METHOD ?? 'copy') !== 'copy') {
    // Symlink the whole plugin dir (dev convenience)
    await rm(dest, { recursive: true, force: true });
    await symlink(resolve(sourceRoot), dest, 'dir');
    log(`Cursor: symlinked to ${dest}`);
    return;
  }

  // Selective copy: always include the cursor manifest, then scoped content dirs
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });

  await cp(`${sourceRoot}/.cursor-plugin`, `${dest}/.cursor-plugin`, {
    recursive: true,
  });

  let dirs;
  if (scope === 'all') {
    const entries = await readdir(sourceRoot, { withFileTypes: true });
    dirs = entries
      .filter(
        (e) =>
          e.isDirectory() &&
          !e.name.startsWith('.') &&
          !CURSOR_IGNORE.has(e.name)
      )
      .map((e) => e.name);
  } else {
    dirs = [scope];
  }

  await Promise.all(
    dirs.map((dir) =>
      cp(`${sourceRoot}/${dir}`, `${dest}/${dir}`, { recursive: true }).catch(
        () => {
          // directory may be empty/missing — not an error
        }
      )
    )
  );

  const scopeLabel = scope === 'all' ? 'all content' : scope;
  log(`Cursor: installed (${scopeLabel}) → ${dest}`);
}

// Claude Code loads skills/, agents/ from the plugin source. rules/ is Cursor-specific
// (.mdc format). Claude marketplace registers the full sourceRoot.

/** @param {string} sourceRoot */
async function installClaude(sourceRoot) {
  const spec = await claudePluginSpec(sourceRoot);
  const mpName = marketplaceName(spec);
  const root = resolve(sourceRoot);

  let code = await runCommand('claude', [
    'plugin',
    'marketplace',
    'add',
    root,
    '--scope',
    'user',
  ]);
  if (code !== 0) {
    warn(
      `warning: "claude plugin marketplace add" exited ${code} — ` +
        `if it's already registered this is safe to ignore.`
    );
    code = await runCommand('claude', [
      'plugin',
      'marketplace',
      'update',
      mpName,
    ]);
    if (code !== 0) {
      throw new Error(
        `claude plugin marketplace add/update failed (exit ${code}).\n` +
          `Try manually: claude plugin marketplace add ${root}`
      );
    }
  }

  code = await runCommand('claude', [
    'plugin',
    'install',
    spec,
    '--scope',
    'user',
  ]);
  if (code !== 0) {
    throw new Error(
      `claude plugin install failed (exit ${code}).\n` +
        `Try manually: claude plugin install ${spec} --scope user`
    );
  }

  log(`Claude Code: installed ${spec} (user scope)`);
  log(
    `  Tip: run /reload-plugins in Claude Code if skills don't appear immediately.`
  );
  log(`  One-off without install: claude --plugin-dir ${root}`);
}

// ---------------------------------------------------------------------------

/**
 * gamut plugin install [cursor|claude] [--scope all|skills|rules|agents]
 *                                            [--plugin-dir <path>]
 *
 * @param {string[]} args
 */
export default async function install(args) {
  const target = args.find((a) => !a.startsWith('-')) ?? 'cursor';
  const scope = getFlag(args, '--scope', 'all') ?? 'all';

  if (!TARGETS.includes(target)) {
    throw new Error(
      `Unknown target: "${target}". Choose from: ${TARGETS.join(', ')}`
    );
  }
  if (!SCOPES.includes(scope)) {
    throw new Error(
      `Unknown scope: "${scope}". Choose from: ${SCOPES.join(', ')}`
    );
  }

  const sourceRoot = await resolveSourceRoot(args);
  const theme = getFlag(args, '--theme');
  const force = args.includes('--force');

  if (theme) {
    resolveTheme(theme);
  }

  if (target === 'cursor') {
    await installCursor(sourceRoot, scope);
  } else if (target === 'claude') {
    await installClaude(sourceRoot);
  }

  if (theme) {
    const { dest, label } = await installDesignMd(
      sourceRoot,
      process.cwd(),
      theme,
      {
        force,
      }
    );
    log(`DESIGN.md: installed (${label}) → ${dest}`);
  }
}

export { listCanonicalThemes };
