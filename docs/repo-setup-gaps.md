# Repo setup gaps

Settings the CI/CD workflows assume but that aren't configured on `Codecademy/skillsoft-gamut` yet.
All of these are repo or org settings, so a PR can't make them.
For the release pipeline's own setup steps, see [docs/release-pipeline-setup.md](./release-pipeline-setup.md).

`main` is protected by a repository **ruleset** named `main`, not by classic branch protection.
Checking with the legacy endpoint is misleading: `gh api repos/Codecademy/skillsoft-gamut/branches/main/protection` returns "Branch not protected" even though the ruleset is active.
Inspect the real config with:

```sh
gh api repos/Codecademy/skillsoft-gamut/rulesets
gh api repos/Codecademy/skillsoft-gamut/rulesets/<id>
```

## 1. The ruleset requires no status checks

The `main` ruleset requires a pull request with one approving review, blocks deletion and force-pushes, and allows only squash merges.
It has no `required_status_checks` rule, so nothing in `quality.yml` currently blocks a merge.

Add a required-status-checks rule listing these check names, which are the job names `quality.yml` reports:

- `build`
- `Check for changeset`
- `format`
- `lint`
- `typecheck`
- `dedupe-check`
- `test`
- `test-storybook`
- `CodeQL`

`typecheck` passes trivially today because no package defines a `typecheck` script yet (tracked in GMT-1761).
Requiring it now means it starts gating as soon as those scripts land.

`preview.yml` also reports a check on pull requests, `Package previews`, which is deliberately left off this list.
A preview publish depends on pkg.pr.new being reachable, so the job is `continue-on-error` and an outage there neither fails a pull request nor blocks a merge.

## 2. No team has access to the repo

`gh api repos/Codecademy/skillsoft-gamut/teams` returns an empty list.
Because of that, both rules in `.github/CODEOWNERS` fail GitHub's own validator:

```sh
gh api repos/Codecademy/skillsoft-gamut/codeowners/errors
```

Both report `Unknown owner on line N: make sure the team @codecademy/gamut exists, is publicly visible, and has write access to the repository`.
The team does exist and is visible (`@codecademy/gamut`, 7 members) and is already listed as a bypass actor on the `main` ruleset.
It just has no access to this repo.

Grant `@codecademy/gamut` write access, then re-run the `codeowners/errors` check to confirm it returns no errors.

## 3. Code owner review isn't required

The ruleset's pull request rule sets `require_code_owner_review: false`.
Until that changes, `.github/CODEOWNERS` only suggests reviewers, it doesn't require them.
Turn it on after fixing gap 2, otherwise every PR will be blocked on an owner GitHub can't resolve.

## 4. Secrets that no longer have a consumer

Nothing in `.github/` reads these anymore.
Revoke them at the source (npm, Netlify, GitHub) as well as deleting them from the repo, since a deleted secret doesn't invalidate the credential.

- `NPM_TOKEN`: replaced by npm Trusted Publishing, which uses OIDC and stores nothing.
- `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`: the Storybook preview deploys that used them are gone.
- `ACTIONS_GITHUB_TOKEN`: a static PAT used by the old publish and `gh-pages` workflows. `release.yml` mints a short-lived GitHub App token instead.

`CODECOV_TOKEN` is still in use by `quality.yml`. Keep it.

## 5. Unattributed-changes approval may block release PRs

The ruleset sets `require_extra_approval_for_unattributed_changes: true`.
`release.yml` opens its "Version Packages" PR with a GitHub App token, so those commits belong to the app rather than to a person.
It may or may not trip the rule: `changesets/action` pushes through the GitHub API by default, which signs the commit with GitHub's own GPG key and attributes it to the app that owns the token, so GitHub may already consider it attributed.
Watch the first release PR.
If it does ask for a second approval, either accept that cost on release PRs or add the release app to the ruleset's bypass actors.

## 6. The Nx Cloud token is read-scoped

`nxCloudAccessToken` in `nx.json` base64-decodes to a UUID with a `|read` suffix.
CI can read the remote cache but never write to it, so nothing a run builds is reusable by anything else through Nx Cloud.

`quality.yml` works around this by caching `.nx/cache` with `actions/cache`, written by the `build` job and restored by `test` and `test-storybook`.
That recovers most of the benefit, but only across runs: caches saved on `main` are readable by every PR branch, while jobs within a single run can't see each other's saves.
So the first run on a branch that touches a widely-depended-on package still builds it in all three jobs.

The reason the token is read-scoped is probably that it is committed to `nx.json` in plaintext, which is acceptable for read access and not for write.
Fixing it means keeping the read token in `nx.json` for local use and supplying a read-write one in CI as an `NX_CLOUD_ACCESS_TOKEN` secret.
Pull requests from forks don't receive secrets, so they would fall back to read-only and rebuild, which is the correct outcome for untrusted code anyway.
Once that lands, the `actions/cache` steps become redundant and should be removed.
