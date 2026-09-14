import { AGENT_TOOLS_PACKAGE, installAgentTools } from './install-agent-tools.mjs';

/** @returns {boolean} */
export function isAgentToolsResolvable() {
  try {
    import.meta.resolve(`${AGENT_TOOLS_PACKAGE}/package.json`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures @skillsoft/gamut-agent-tools is installed, installing it (as a
 * devDependency) if it's missing and installation wasn't opted out of.
 *
 * @param {{ noInstall?: boolean }} [options]
 * @returns {Promise<boolean>} whether it's resolvable after this call
 */
export async function ensureAgentTools({ noInstall = false } = {}) {
  if (isAgentToolsResolvable()) {
    return true;
  }
  if (noInstall) {
    return false;
  }
  await installAgentTools();
  return isAgentToolsResolvable();
}
