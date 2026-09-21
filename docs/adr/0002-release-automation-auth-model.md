# Release automation uses a GitHub App identity and npm Trusted Publishing, not static tokens

`main` is protected by a ruleset that requires a review before merge, and is meant to require `quality.yml`'s status checks as well.
[docs/repo-setup-gaps.md](../repo-setup-gaps.md) tracks adding those checks.

GitHub Actions' default `GITHUB_TOKEN` cannot trigger other workflows when it authors a push or PR.
A "Version Packages" PR opened by `changesets/action` with that token would never get those checks and would be permanently unmergeable.

Publishing to the new `@skillsoft` npm org also needs credentials.
We do not want a long-lived `NPM_TOKEN` secret in the repo.

We considered the existing `REPO_ACCESS_TOKEN` repo secret as a shortcut, but nothing in this repo's workflows references it, and its owner and scope cannot be verified.
Relying on an orphaned token is worse than standing up dedicated infrastructure.

Decision: mint short-lived tokens at CI runtime from a dedicated GitHub App (`actions/create-github-app-token`), installed org-wide so future repos doing the same migration do not repeat this setup, scoped per-repo to `Contents: write` and `Pull requests: write`.
For npm, use Trusted Publishing (OIDC, no stored token) instead of `NPM_TOKEN`.
This is the pattern `ace`'s release pipeline was modeled on, extended here to actually exercise npm's OIDC path (`ace` publishes to an internal Nexus registry, so it never did).

Consequence: Trusted Publishing requires npm CLI ≥ 11.5.1, which Node 22 (bundled npm 10.9.2) does not reach.
That is why `.nvmrc` moves to Node 24 for CI and local dev, independent of whatever Node versions published packages support for consumers.
Creating the GitHub App and registering the npm trusted publisher (on npmjs.com, which needs org-owner access) are one-time manual setup steps.
This PR cannot do them.
