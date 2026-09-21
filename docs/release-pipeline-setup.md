# Release pipeline: one-time setup

Two things need doing outside this repo before `.github/workflows/release.yml` can actually publish anything.
Neither can be done from a PR because both need org-owner access.

## 1. GitHub App for release automation

`main` requires a review before merge, and will require status checks once they are added to its ruleset (see [docs/repo-setup-gaps.md](./repo-setup-gaps.md)).
GitHub Actions' default `GITHUB_TOKEN` is blocked from triggering other workflows when it authors a push or PR, so a "Version Packages" PR opened with the default token would never get its required checks and would be permanently unmergeable.
`release.yml` mints its token from a dedicated GitHub App instead.
See [docs/adr/0002-release-automation-auth-model.md](./adr/0002-release-automation-auth-model.md) for why.

1. Org settings → Developer settings → GitHub Apps → New GitHub App.
   - Name: for example `skillsoft-release-bot`.
   - Webhook: uncheck "Active" (not needed).
   - Repository permissions: `Contents: Read and write`, `Pull requests: Read and write`.
   - Leave "only on this account" as-is unless you specifically want other orgs to be able to install it.
1. Generate a private key on the app's settings page.
   This downloads a `.pem` file.
   Note the app's **Client ID** too (also on the settings page).
1. Install the app (same settings page → Install App) on the org, scoped to "Only select repositories" → this repo.
   Add other repos here as they adopt the same pipeline, rather than creating a new App per repo.
1. Add two secrets.
   Use org-level secrets if you want other repos to reuse this app without re-adding them, otherwise repo-level:
   - `RELEASE_APP_CLIENT_ID`: the Client ID from step 2.
   - `RELEASE_APP_PRIVATE_KEY`: full contents of the `.pem` file from step 2.

## 2. npm Trusted Publisher registration

Needed for each published `@skillsoft/*` package: everything in `.changeset/config.json`'s `fixed` group, plus `gamut-illustrations`, `gamut-tests`, and `eslint-plugin-gamut`.
Private packages such as `macros` never publish, so they need nothing.

1. On npmjs.com, find the package's settings → Trusted Publisher.
   If npm supports pre-registration for a scope you own before first publish, use the scope settings instead.
1. Add a GitHub Actions publisher pointing at `Codecademy/skillsoft-gamut`, workflow file `release.yml`, no environment (we do not scope the job to a GitHub Actions environment).
1. If npm requires the package to already exist before a trusted publisher can be attached, do a one-time manual `npm publish --access public` from an org-owner's own authenticated npm session first, then attach the trusted publisher for every subsequent CI-driven publish.
   Check npm's current docs at setup time, since this constraint may have changed.

Trusted publishing needs npm 11.5.1 or newer.
`release.yml` gets npm from the Node version in `.nvmrc`, so bumping that file down to a Node release bundling an older npm will break publishing with an authentication error rather than an obvious version error.

Only `release.yml` needs this.
`preview.yml` publishes through pkg.pr.new, which serves its own npm-compatible URLs and never touches the npm registry.

## 3. pkg.pr.new GitHub App

`preview.yml` does nothing until the [pkg.pr.new GitHub App](https://github.com/apps/pkg-pr-new) is installed on this repo.
The app authorizes the upload and posts the install instructions as a PR comment, which is why the workflow needs no secrets.

The app requests `contents: read`, `pull-requests: write`, `checks: write`, `statuses: write`, and `actions: read`.
It has no write access to code.
Preview tarballs are served without authentication, so treat publishing a preview as publishing to the public internet.
Any package that should not be readable by anyone has to be marked `"private": true`.

## 4. Branch protection

`main` is protected by a ruleset, but that ruleset requires no status checks.
Adding them, along with the other repo settings this pipeline assumes, is covered in [docs/repo-setup-gaps.md](./repo-setup-gaps.md).

The old "Check Release Plan" required status check no longer exists.
`quality.yml`'s "Check for changeset" job replaces it, so that is the name to require.
