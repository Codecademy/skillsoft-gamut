# @skillsoft/gamut-agent-tools

Skills, rules, and product design context for AI coding agents (Cursor, Claude Code) working in apps that depend on `@skillsoft/gamut`.

This ships as its own package, separate from `@skillsoft/gamut`, because it's entirely optional: apps that don't use an AI coding agent have no reason to install it. It declares `@skillsoft/gamut` as a `peerDependency` rather than bundling a copy, so it stays compatible with whichever Gamut version an app already has without duplicating it in `node_modules`.

You won't normally install this yourself — see [Using this in an app repo](#using-this-in-an-app-repo).

## What's here

| Path                            | Purpose                                                                                                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DESIGN.*.md`                     | Product-specific design context — tokens, semantic roles, patterns — matched to the Gamut theme an app uses. See `DESIGN.md` for which file goes with which theme. |
| `skills/`                         | Task playbooks invoked by name for focused work (theming, ColorMode, buttons, layout, forms, auditing, …).                                                          |
| `rules/`                          | Always-on guardrails applied to all Gamut code (e.g. accessibility).                                                                                                |
| `agents/`                         | Reserved for future agent definitions; currently empty.                                                                                                             |
| `.claude-plugin/`, `.cursor-plugin/` | Plugin manifests consumed by Claude Code and Cursor respectively.                                                                                                |
| `cli/`                            | Command implementations for the `gamut plugin` CLI (see [The CLI lives here, not in @skillsoft/gamut](#the-cli-lives-here-not-in-skillsoftgamut) below).           |

## Using this in an app repo

Install and manage the plugin with the `gamut` CLI, which ships in `@skillsoft/gamut` — run it from your app repo root, with `--theme` matching that app:

```sh
gamut plugin install cursor --theme <name>
# refresh after upgrading @skillsoft/gamut:
gamut plugin update cursor --theme <name> --force
```

The first time you run `gamut plugin install` or `update`, it installs `@skillsoft/gamut-agent-tools` as a devDependency automatically if it isn't already present — you don't need to `yarn add` it yourself. Installing copies the matching `DESIGN.*.md`, `skills/`, and `rules/` into the app repo so the agent can read them directly.

Before large PRs, or when onboarding an existing codebase, run the `gamut-review` skill to audit for Gamut usage — dependencies, setup, import patterns, `styled()` wrapping that bypasses system props, hardcoded colors, bespoke component duplication, and test conventions.

### Moving from `@codecademy/gamut`

If your app still depends on `@codecademy/gamut*`, the `gamut-scope-swap` skill helps with the move to `@skillsoft/gamut*`. It works alongside the [`@skillsoft/gamut-codemods`](../gamut-codemods/README.md) `scope-swap` preset. The codemod does the mechanical rewrite. The skill reads what it reports, including warnings, leftovers, and next steps, and helps with the parts it can't rewrite: deep imports, `Video`, renamed Menu exports, tsconfig `dom`, jest mocks, ESLint plugin keys, Module Federation config, and preview builds. It doesn't run the codemod unless you ask it to.

Install the plugin after the swap. The `gamut` CLI comes from `@skillsoft/gamut`, so that package has to be in the app first.

## The CLI lives here, not in `@skillsoft/gamut`

`@skillsoft/gamut`'s `bin/gamut.mjs` is a thin bootstrap shim: it only knows how to check whether `@skillsoft/gamut-agent-tools` is installed, auto-install it if not (for `install`/`update`), and print help. Once that's resolved, it dynamically imports the actual `install`/`update`/`list`/`remove` command bodies from `cli/commands/plugin/` in *this* package and hands off execution to them.

The tooling that manages this content lives with the content it manages, rather than being bundled into `@skillsoft/gamut` itself. `cli/` isn't a standalone executable — it has no `bin` entry of its own — it's only ever invoked via the `gamut plugin ...` command.

## Full documentation

For the complete setup guide, the artifact-selection table (`DESIGN.md` vs `skills/` vs `rules/`), and the full list of exported skills, see the [Best practices](https://gamut.codecademy.com/?path=/docs-meta-ai-tooling-gamut-plugin-best-practices--page) page in Storybook.
