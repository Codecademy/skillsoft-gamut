import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

import { log } from './io.mjs';
import { runCommand } from './run-command.mjs';

export const AGENT_TOOLS_PACKAGE = '@skillsoft/gamut-agent-tools';

/**
 * Installs @skillsoft/gamut-agent-tools as a devDependency of the consuming
 * project, using whichever package manager's lockfile is present in the
 * current working directory.
 *
 * No version is pinned here — @skillsoft/gamut-agent-tools declares
 * @skillsoft/gamut as a peerDependency with a semver range, so npm/yarn/pnpm
 * pick (and warn about) a compatible version the same way they already do
 * for any other peer dependency. This keeps the two packages independently
 * versioned without this CLI needing its own copy of that resolution logic.
 *
 * @returns {Promise<void>}
 */
export async function installAgentTools() {
  const pm = await detectPackageManager();
  log(`${AGENT_TOOLS_PACKAGE} isn't installed yet — installing with ${pm}...`);

  const [command, args] = installCommand(pm);
  const code = await runCommand(command, args);
  if (code !== 0) {
    throw new Error(
      `"${command} ${args.join(' ')}" failed (exit ${code}). Install ` +
        `${AGENT_TOOLS_PACKAGE} manually and re-run this command.`
    );
  }
}

/** @returns {Promise<'yarn' | 'pnpm' | 'npm'>} */
async function detectPackageManager() {
  if (await fileExists('pnpm-lock.yaml')) {
    return 'pnpm';
  }
  if (await fileExists('yarn.lock')) {
    return 'yarn';
  }
  return 'npm';
}

/** @param {string} file */
async function fileExists(file) {
  return access(resolve(process.cwd(), file)).then(
    () => true,
    () => false
  );
}

/**
 * @param {'yarn' | 'pnpm' | 'npm'} pm
 * @returns {[string, string[]]}
 */
function installCommand(pm) {
  switch (pm) {
    case 'yarn':
      return ['yarn', ['add', '-D', AGENT_TOOLS_PACKAGE]];
    case 'pnpm':
      return ['pnpm', ['add', '-D', AGENT_TOOLS_PACKAGE]];
    default:
      return ['npm', ['install', '--save-dev', AGENT_TOOLS_PACKAGE]];
  }
}
