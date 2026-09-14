import { stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AGENT_TOOLS_PACKAGE,
  installAgentTools,
} from './install-agent-tools.mjs';

/**
 * Returns the absolute path to the agent-tools plugin source, resolving
 * @skillsoft/gamut-agent-tools if it's installed, or the value of
 * --plugin-dir if provided.
 *
 * agent-tools ships as its own opt-in package rather than being bundled
 * inside @skillsoft/gamut, so consumers who don't want it never install it.
 * When it's missing and --no-install wasn't passed, this installs it
 * automatically (see installAgentTools) before resolving again.
 *
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function resolvePluginDir(args) {
  const override = await resolvePluginDirOverride(args);
  if (override) {
    return override;
  }

  let installed = resolveAgentToolsDir();
  if (!installed && !args.includes('--no-install')) {
    await installAgentTools();
    installed = resolveAgentToolsDir();
  }

  if (!installed) {
    throw new Error(
      `${AGENT_TOOLS_PACKAGE} is not installed. Run ` +
        `"yarn add -D ${AGENT_TOOLS_PACKAGE}" (or the npm/pnpm equivalent) and try again.`
    );
  }
  return installed;
}

/**
 * Same as resolvePluginDir, but never installs anything — returns null
 * instead of throwing when agent-tools isn't installed. Used by commands
 * like `list` and `remove` that shouldn't have the side effect of
 * installing a package just to report status or clean up.
 *
 * @param {string[]} args
 * @returns {Promise<string | null>}
 */
export async function tryResolvePluginDir(args) {
  const override = await resolvePluginDirOverride(args);
  return override ?? resolveAgentToolsDir();
}

/**
 * @param {string[]} args
 * @returns {Promise<string | null>}
 */
async function resolvePluginDirOverride(args) {
  const override = getFlag(args, '--plugin-dir');
  if (!override) {
    return null;
  }
  const abs = resolve(override);
  const st = await stat(abs).catch(() => null);
  if (!st?.isDirectory()) {
    throw new Error(`--plugin-dir path not found: ${abs}`);
  }
  return abs;
}

/** @returns {string | null} */
function resolveAgentToolsDir() {
  try {
    const pkgJsonUrl = import.meta.resolve(
      `${AGENT_TOOLS_PACKAGE}/package.json`
    );
    return dirname(fileURLToPath(pkgJsonUrl));
  } catch {
    return null;
  }
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
