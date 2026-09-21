# Contributing

## Setup

Node comes from `.nvmrc` and Yarn from the `packageManager` field in `package.json`.
Run `corepack enable` once, then `yarn install`.

Useful scripts:

| Script | What it does |
| --- | --- |
| `yarn build` | Build every package |
| `yarn test` | Run unit tests |
| `yarn lint` | ESLint over the repo |
| `yarn format` | Fix lint and formatting in place |

## Changesets

A changeset records which packages you changed and how their versions should move.
Versions, GitHub Releases, and changelogs are generated from these files, so a change to a published package without one cannot be released.

Create it with:

```bash
yarn changeset
```

The prompt asks which packages you changed, whether each is a `major`, `minor`, or `patch`, and for a summary.
It writes a file to `.changeset/`, which you commit with your code.

### Releasing Changesets

Once a changeset bump is merged into `main`, Changesets will open a new pull request titled "Version Packages" that applies your changeset, bumps versions, writes changelogs, and deletes the changesets it consumed.
As additional changesets get added to `main`, this PR will be updated, allowing us to batch releases by simply waiting to merge the "Version Packages" PR.

Once merged, Changesets will automatically publish to NPM and create GitHub Releases.

### Verifying Changesets

The `changeset-check` job runs on every pull request, and fails only when files inside a versionable package changed and no changeset is present.

- Changes inside a published package need a changeset, including tests, READMEs, and config in that package, because the check looks at the package directory rather than at what gets published.
- Private packages are not versionable, so they do not need one.
  That includes the repo root.
- A docs-only or CI-only pull request that does not touch a published package needs nothing.

If you touched a published package but nothing should be released, record that explicitly:

```bash
yarn changeset add --empty
```

An empty changeset satisfies the check without bumping anything.

### Some packages release together

Packages declared as [`fixed` in `.changeset/config.json`](.changeset/config.json) always share a version number.
Any package _not_ in that group is versioned independently.

Declare only the package you actually changed.
A bump on any package in the group, such as a `patch` or `minor` on `@skillsoft/gamut`, moves every package in the group to that same new version.

### Writing the summary

The summary becomes the release note entry, rendered with a link to your pull request and your username.
Write it for someone deciding whether to upgrade, not as a commit message.

```markdown
---
'@skillsoft/gamut': minor
---

Add a `ghost` variant to `Button`.
```

Pull request titles and descriptions do not reach the changelog.
Only the changeset summary does.

### Breaking changes

Breaking changes **must** be coordinated with maintainers ahead of time since we have a strong commitment to backwards compatibility.

`major` bumps happen for anything that requires consumers to change their code.
The summary for a breaking change should include short migration guidance or links to more complete migration guides.

## Testing your changes in another app

Every pull request publishes installable preview packages through pkg.pr.new.
A bot comments with the install commands:

```bash
yarn add https://pkg.pr.new/@skillsoft/gamut@<pr-number>
```

Previews expire and are not a release.
Don't commit one to a lockfile on a long-lived branch or cite one in docs.
