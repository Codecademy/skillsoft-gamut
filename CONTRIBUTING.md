# Contributing

## Setup

Node comes from `.nvmrc` and Yarn from the `packageManager` field in `package.json`.
Run `corepack enable` once, then `yarn install`.

Useful scripts:

| Script        | What it does                     |
| ------------- | -------------------------------- |
| `yarn build`  | Build every package              |
| `yarn test`   | Run unit tests                   |
| `yarn lint`   | ESLint over the repo             |
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

### Choosing the bump

While we are on `0.x.x`, pick the bump for what we are willing to publish this week, not for how 1.0 will feel:

- `patch` — fix, no API change
- `minor` — feature **or** breaking change
- never `major`

A `major` on `main` makes the next Version Packages merge `1.0.0` with no beta or rc.

After `1.0.0`, ordinary semver applies: `patch` for fixes, `minor` for features. `major` (breaking changes) should be avoided for as long as possible.

### Breaking changes

Breaking changes **must** be coordinated with maintainers ahead of time since we have a strong commitment to backwards compatibility and generally target at least a year between majors.
The summary should include short migration guidance or links to more complete migration guides.

### Prereleases

[Prerelease mode](https://changesets.dev/guide/prereleases) suffixes versions (`1.1.0-beta.0`) and publishes them to that dist-tag (`beta`), not `latest`.

```bash
yarn changeset pre enter beta
```

That only writes `.changeset/pre.json` on `main`.
It does not publish.
Unreleased changesets already on `main` are included in the first prerelease, so an open Version Packages PR that still shows `1.1.0` becomes `1.1.0-beta.0` after `release.yml` rebuilds it.
Do not merge that PR while it still shows a stable version if you wanted a beta.
`pre enter` after a stable `1.1.0` has published cannot turn it into `1.1.0-beta.0`.

The bump type still selects the number in front of `-beta`:

- from `0.x.x`, a `major` is `1.0.0-beta.0` (this is how we start the 1.0 train)
- from `1.0.x`, a `minor` is `1.1.0-beta.0`; a `major` is `2.0.0-beta.0`
- a `patch` only ticks the patch, e.g. `1.0.1-beta.0`

Later changesets in the same train tick `1.1.0-beta.1`, `.2`, and so on.

```bash
yarn changeset pre exit
```

The next Version Packages merge is the matching stable release (`1.0.0`, `1.1.0`, …).

If `1.0.x` patches must continue while `1.1.0-beta` is in flight, that needs a backport branch.
`pre enter` on `main` does not keep a stable line open.

## Testing your changes in another app

Every pull request publishes installable preview packages through pkg.pr.new.
A bot comments with the install commands:

```bash
yarn add https://pkg.pr.new/@skillsoft/gamut@<pr-number>
```

Previews expire and are not a release.
Don't commit one to a lockfile on a long-lived branch or cite one in docs.
