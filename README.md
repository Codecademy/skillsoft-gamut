# Gamut

_The component library & design system for Skillsoft and Codecademy._ ✨

---

[![ci](https://github.com/Codecademy/skillsoft-gamut/actions/workflows/quality.yml/badge.svg?label=ci)](https://github.com/Codecademy/skillsoft-gamut/actions/workflows/quality.yml)
[![coverage](https://img.shields.io/codecov/c/github/Codecademy/skillsoft-gamut?label=coverage)](https://codecov.io/gh/Codecademy/skillsoft-gamut)
[![npm](https://img.shields.io/npm/v/@skillsoft/gamut.svg?label=npm)](https://www.npmjs.com/package/@skillsoft/gamut)

This repository is a monorepo that we manage using [NX](https://nx.dev/). That means that we publish several packages to npm from the same codebase, including:

## Individual Packages

[`gamut`: Our React UI component library](/packages/gamut/README.md)

- [![npm: @skillsoft/gamut](https://img.shields.io/npm/v/@skillsoft/gamut.svg?label=npm:%20@skillsoft/gamut)](https://www.npmjs.com/package/@skillsoft/gamut)

[`gamut-styles`: Utility styles for Gamut components and codecademy apps](/packages/gamut-styles/README.md)

- [![npm: @skillsoft/gamut-styles](https://img.shields.io/npm/v/@skillsoft/gamut-styles.svg?label=npm:%20@skillsoft/gamut-styles)](https://www.npmjs.com/package/@skillsoft/gamut-styles)

[`gamut-icons`: SVG Icons for Gamut components and codecademy apps](/packages/gamut-icons/README.md)

- [![npm: @skillsoft/gamut-icons](https://img.shields.io/npm/v/@skillsoft/gamut-icons.svg?label=npm:%20@skillsoft/gamut-icons)](https://www.npmjs.com/package/@skillsoft/gamut-icons)

[`variance`: TypeScript CSS in JS utility library](/packages/variance/README.md)

- [![npm: @skillsoft/variance](https://img.shields.io/npm/v/@skillsoft/variance.svg?label=npm:%20@skillsoft/variance)](https://www.npmjs.com/package/@skillsoft/variance)

[`styleguide`: Styleguide Documentation & storybook development sandbox](/packages/styleguide/README.md)

## Local development

1.  Run `yarn` in the root directory
2.  Run `yarn build` to build all of the packages (certain packages like `gamut-icons` need to be built to function in storybook).

### Running the storybook styleguide

1.  Run `yarn nx storybook styleguide` to start the storybook server
2.  Add new stories to `packages/styleguide/src`
3.  Stories are written using storybook's [Component Story Format](https://storybook.js.org/docs/formats/component-story-format/) and [MDX](https://storybook.js.org/docs/writing-docs/mdx#basic-example). Check out our comprehensive guide on writing stories [here](https://gamut.codecademy.com/?path=/docs/meta-stories--docs#quick-start).

### Publishing Modules

Versioning and publishing run on [Changesets](https://github.com/changesets/changesets).
A pull request that changes a versionable package needs a changeset.
Merging to `main` opens a "Version Packages" pull request that publishes when merged.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add one and which packages release together.
Coordinate breaking changes with maintainers first.

### Testing a change in another app

Every pull request publishes installable preview packages through pkg.pr.new.
A bot comments with the install commands:

```bash
yarn add https://pkg.pr.new/@skillsoft/gamut@<pr-number>
```

Previews never reach npm and they expire, so don't commit one to a lockfile on a long-lived branch.

### Working with pre-published changes

> NOTE: Due to the inconsistencies of symlinks in a monorepo, _instead_ of using `yarn link`, we recommend using the `npm-link-better` package with the `--copy` flag to copy packages into your local repo's `node_modules` directory.

**Initial Setup:**

1. Ensure you have npm-link-better installed: `npm install -g npm-link-better`
1. Ensure you've built the entire `gamut` repo since you last synced: `yarn build`

**Instructions:**

For each of your local `gamut` packages (e.g. `gamut`), you'll need to do 2 things to get it working in your project:

1. Make sure your package changes have been built into the `gamut/packages/[package]/dist` folder.

   - `yarn build`<br/>or<br/>
     `yarn build:watch` (not all packages support this yet)

1. Copy that built `/dist` folder to your project's `node_modules/@skillsoft/[package]` folder.
   ```bash
   cd myProjectRepo
   npm-link-better --copy --watch path/to/gamut/packages/[package]
   ```
   > NOTE: The `--watch` flag will automatically copy your package into `node_modules` everytime it is built.

<details>
<summary>Example Workflow</summary>

Let's say we are making changes to the `gamut` package, and our app that uses the `gamut` package uses `yarn start` to build, serve, and watch our app for changes.

Let's also assume these two repos are sibling directories inside of a folder called `repos`

```
repos
  |- gamut
  |- my-app
```

We would run the following commands in 3 separate shells

```bash
# Shell 1: Auto-build Gamut changes
cd repos/gamut/packages/gamut
yarn build:watch

# Shell 2: Auto-copy built Gamut changes to my-app.
cd repos/my-app
npm-link-better --copy --watch ../gamut/packages/gamut

# Shell 3: Auto-update app when anything changes.
cd repos/my-app
yarn start
```

This would allow us to make a change in our `gamut` package, and see that change automatically reflected in our local app in the browser.

</details>

<details>
  <summary>Troubleshooting</summary>

- If you see compilation issues in your project's dev server after running `npm-link-better`, you may have to restart your app's dev server.
- If you are seeing compilation issues in a `gamut` package, you may need to rebuild the whole repository via

  ```bash
  yarn build
  ```

</details>

<details>
  <summary>Instructions for using `yarn link` instead (not recommended)</summary>

For quicker development cycles, it's possible to run a pre-published version of Gamut in another project. We do that using
symlinks (the following instructions assume you have set up and built Gamut):

1. `cd /path/to/gamut/packages/gamut`
1. `yarn link`
1. `cd path/to/other/repo`
1. `yarn link @skillsoft/gamut`
1. `yarn install`

If your other project uses React, you must link that copy of React in Gamut:

1. `cd path/to/other/repo`
1. `cd node_modules/react`
1. `yarn link`
1. `cd /path/to/gamut/packages/gamut`
1. `yarn link react`
1. `yarn build`

[See the docs](https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react)
for more information for why you have to do this.

</details>
<br/>

**NX**

This monorepo uses [NX](https://nx.dev/) to cache previous builds locally and in CI.

The config for NX is located at [/nx.json](/nx.json), along with `project.json` files for each package.

### Breaking Changes

Breaking changes must be coordinated with the maintainers ahead of time.
While packages are on `0.x.x`, select `minor` when `yarn changeset` asks for the bump type.
After `1.0.0`, select `major`.

```markdown
---
'@skillsoft/gamut': minor
---

Remove the deprecated `primary-blue` and `secondary-red` Button variants.
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the complete versioning and prerelease policy.

#### Breaking Changes Release Process

Because Gamut is a separate repository from its consumers, it can be tricky to coordinate technically breaking changes.
If your changes will require changes in any downstream repositories:

1. Open a PR in Gamut, which publishes preview packages
1. Open PRs in the consuming repositories against those previews
1. Update each downstream PR description to link to the Gamut PR, and vice versa
1. Once all PRs have been approved, merge your Gamut PR first
1. Update your repository PRs to use the published version once the release PR merges
1. Merge your repository PRs

This process minimizes the likelihood of accidental breaking changes in Gamut negatively affecting development on our other repositories.

### Changelog Descriptions

Changelog content comes from the changeset summary, not the PR title or PR description.

## AI Tool Plugins

Gamut ships an agent-tools plugin with skills, rules, and agents for Claude Code and Cursor. The `gamut` CLI is included in `@skillsoft/gamut`, so run it via `npx` from any project that has the package installed. The plugin content itself lives in the separate, optional `@skillsoft/gamut-agent-tools` package; the CLI installs it automatically the first time you run `gamut plugin install` if it isn't already a dependency.

### Installing

**Claude Code**

```bash
npx gamut plugin install claude
```

Registers the plugin at user scope via `claude plugin marketplace add`, then installs it. Skills become available as slash commands (e.g. `/gamut-buttons`, `/gamut-review`). If they don't appear immediately, run `/reload-plugins` inside Claude Code.

**Cursor**

```bash
npx gamut plugin install cursor
```

Copies skills, rules, and agents into your project's `.cursor/` directory.

### Themes — DESIGN.md

Add `--theme` to also write a `DESIGN.md` into the current directory with theme-specific design tokens and component guidance:

```bash
npx gamut plugin install cursor --theme core       # Codecademy Core
npx gamut plugin install cursor --theme percipio   # Percipio / LX Studio
npx gamut plugin install cursor --theme admin      # Admin / Platform
```

Use `--force` to overwrite an existing `DESIGN.md`.

### Scoped installs

Install only a subset of the plugin content with `--scope`:

```bash
npx gamut plugin install cursor --scope skills    # skills only
npx gamut plugin install cursor --scope rules     # rules only
npx gamut plugin install cursor --scope agents    # agents only
```

### Updating and removing

```bash
npx gamut plugin install           # re-run to update to the latest version
npx gamut plugin remove cursor     # remove the Cursor plugin
npx gamut plugin remove claude     # remove the Claude Code plugin
npx gamut plugin list              # list installed plugins
```

### One-off (no install)

Run Claude Code with the plugin loaded for a single session without registering it:

```bash
claude --plugin-dir ./node_modules/@skillsoft/gamut-agent-tools
```

## Publishing Storybook

Storybook is built and published automatically when there are merges into the main branch.
