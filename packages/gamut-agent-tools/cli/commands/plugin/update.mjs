import { log } from '../../lib/io.mjs';
import { getFlag } from '../../lib/source-root.mjs';
import install, { TARGETS } from './install.mjs';

/**
 * gamut plugin update [cursor|claude] [--scope all|skills|rules|agents]
 *                                           [--plugin-dir <path>]
 *
 * Re-runs install with the same arguments. For Cursor this does an in-place
 * copy replacing any existing installation. For Claude Code it updates the
 * marketplace entry and re-installs.
 *
 * @param {string[]} args
 */
export default async function update(args) {
  const target = args.find((a) => !a.startsWith('-')) ?? 'cursor';
  const scope = getFlag(args, '--scope', 'all') ?? 'all';

  if (!TARGETS.includes(target)) {
    throw new Error(
      `Unknown target: "${target}". Choose from: ${TARGETS.join(', ')}`
    );
  }

  log(
    `Updating Gamut plugin for ${target}${
      scope !== 'all' ? ` (scope: ${scope})` : ''
    }…`
  );
  await install(args);
}
