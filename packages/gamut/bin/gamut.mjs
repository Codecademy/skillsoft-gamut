#!/usr/bin/env node

import {
  ensureAgentTools,
  isAgentToolsResolvable,
} from './lib/ensure-agent-tools.mjs';
import { AGENT_TOOLS_PACKAGE } from './lib/install-agent-tools.mjs';
import { error, log } from './lib/io.mjs';

/**
 * Gamut CLI
 *
 * Usage:
 *   gamut plugin install [cursor|claude] [--scope all|skills|rules|agents]
 *   gamut plugin remove  [cursor|claude]
 *   gamut plugin update  [cursor|claude] [--scope all|skills|rules|agents]
 *   gamut plugin list
 *
 * This file only owns argument dispatch, help text, and the bootstrap logic
 * that resolves (and, for install/update, auto-installs) the separate
 * @skillsoft/gamut-agent-tools package. The actual command bodies live
 * there and are loaded dynamically once it's resolvable.
 */

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------

function printHelp() {
  log(`
gamut — Gamut design system CLI

Usage:
  gamut <command> [subcommand] [options]

Commands:
  plugin    Manage the Gamut plugin in your AI/design tools

Run "gamut plugin --help" for plugin subcommands.
`);
}

function printPluginHelp() {
  log(`
gamut plugin — Manage the Gamut plugin

Subcommands:
  install [target] [--scope <scope>] [--theme <theme>]  Install the plugin (+ optional DESIGN.md)
  remove  [target]                                      Remove an installed plugin
  update  [target] [--scope <scope>] [--theme <theme>]  Update an installed plugin
  list                                                   Show installation status for all targets

Targets:   cursor (default)  |  claude
Scopes:    all (default)     |  skills  |  rules  |  agents
Themes:    core | admin | platform | percipio | lxstudio  (--theme copies DESIGN.md to repo root)

Run "gamut plugin <subcommand> --help" for subcommand-specific options.

Plugin content ships separately as ${AGENT_TOOLS_PACKAGE}, installed
automatically the first time you run "gamut plugin install" or "update".

Examples:
  gamut plugin install
  gamut plugin install claude
  gamut plugin install cursor --theme percipio
  gamut plugin install cursor --scope skills
  gamut plugin remove claude
  gamut plugin update
  gamut plugin list
`);
}

/** @type {Record<string, string>} */
const VERB_HELP = {
  install: `
Usage:
  gamut plugin install [target] [options]

Install the Gamut plugin into an AI tool.

Arguments:
  target               Tool to install into (default: cursor)
                       cursor | claude

Options:
  --scope <scope>      Content to install (default: all)
                       all | skills | rules | agents
  --theme <theme>      Copy DESIGN.*.md to ./DESIGN.md in the current directory
                       core | admin | platform | percipio | lxstudio
                       (admin/platform use Codecademy DESIGN; aliases: codecademy, cc, lx-studio)
  --force              Overwrite existing DESIGN.md when using --theme
  --plugin-dir <path>  Use this directory instead of ${AGENT_TOOLS_PACKAGE}
  --no-install         Don't auto-install ${AGENT_TOOLS_PACKAGE} if missing
  -h, --help           Show this help message

${AGENT_TOOLS_PACKAGE} ships separately from @skillsoft/gamut. If it isn't
already installed, this command installs it (as a devDependency) before
proceeding, unless --no-install is passed.

Examples:
  gamut plugin install
  gamut plugin install claude
  gamut plugin install cursor --theme core
  gamut plugin install cursor --theme percipio --force
  gamut plugin install cursor --scope skills
  gamut plugin install cursor --plugin-dir ./my-agent-tools
`,
  update: `
Usage:
  gamut plugin update [target] [options]

Update the Gamut plugin in an AI or design tool.
Equivalent to re-running install — replaces the existing installation in place.

Arguments:
  target               Tool to update (default: cursor)
                       cursor | claude

Options:
  --scope <scope>      Content to update (default: all)
                       all | skills | rules | agents
  --theme <theme>      Refresh ./DESIGN.md (same themes as install)
  --force              Overwrite existing DESIGN.md when using --theme
  --plugin-dir <path>  Use this directory instead of ${AGENT_TOOLS_PACKAGE}
  --no-install         Don't auto-install ${AGENT_TOOLS_PACKAGE} if missing
  -h, --help           Show this help message

Examples:
  gamut plugin update
  gamut plugin update claude
  gamut plugin update cursor --theme core --force
  gamut plugin update cursor --scope skills
`,
  list: `
Usage:
  gamut plugin list [options]

Show installation status for all supported targets.

Options:
  --plugin-dir <path>  Use this directory instead of ${AGENT_TOOLS_PACKAGE}
  -h, --help           Show this help message

Does not install ${AGENT_TOOLS_PACKAGE} if it's missing — reports its
absence instead.

Examples:
  gamut plugin list
`,
  remove: `
Usage:
  gamut plugin remove [target] [options]

Remove the installed Gamut plugin from an AI tool.

Arguments:
  target               Tool to remove from (default: cursor)
                       cursor | claude

Options:
  --plugin-dir <path>  Use this directory instead of ${AGENT_TOOLS_PACKAGE}
  -h, --help           Show this help message

Does not install ${AGENT_TOOLS_PACKAGE} if it's missing — there's nothing
to remove in that case.

Examples:
  gamut plugin remove
  gamut plugin remove claude
`,
};

/** @param {string} verb */
function printVerbHelp(verb) {
  log(VERB_HELP[verb]);
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

const VERBS = ['install', 'update', 'list', 'remove'];
const NON_INSTALLING_VERBS = ['list', 'remove'];

const args = process.argv.slice(2);
const [noun, verb, ...rest] = args;

if (!noun || noun === '--help' || noun === '-h') {
  printHelp();
  process.exit(noun ? 0 : 1);
}

if (noun !== 'plugin') {
  error(`Unknown command: "${noun}"`);
  printHelp();
  process.exit(1);
}

if (!verb || verb === '--help' || verb === '-h') {
  printPluginHelp();
  process.exit(verb ? 0 : 1);
}

if (!VERBS.includes(verb)) {
  error(`Unknown plugin subcommand: "${verb}"`);
  printPluginHelp();
  process.exit(1);
}

if (rest.includes('--help') || rest.includes('-h')) {
  printVerbHelp(verb);
  process.exit(0);
}

try {
  if (NON_INSTALLING_VERBS.includes(verb)) {
    if (!isAgentToolsResolvable()) {
      log(
        `${AGENT_TOOLS_PACKAGE} is not installed — nothing to ${verb}.\n` +
          `Run "gamut plugin install" to install it.`
      );
      process.exit(0);
    }
  } else {
    const ok = await ensureAgentTools({
      noInstall: rest.includes('--no-install'),
    });
    if (!ok) {
      error(
        `${AGENT_TOOLS_PACKAGE} is not installed. Run ` +
          `"yarn add -D ${AGENT_TOOLS_PACKAGE}" (or drop --no-install) and try again.`
      );
      process.exit(1);
    }
  }

  const cmd = await import(
    `${AGENT_TOOLS_PACKAGE}/cli/commands/plugin/${verb}.mjs`
  );
  await cmd.default(rest);
} catch (/** @type {any} */ err) {
  error(`Error: ${err.message}`);
  process.exit(1);
}
