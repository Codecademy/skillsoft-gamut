# Post-1.0 prereleases move off the `latest` dist-tag

Working toward a 1.0.0 release, the path is `0.1.0` → possibly `1.0.0-alpha.N` → `1.0.0-beta.N` → `1.0.0-rc.N` → `1.0.0`.
We had to decide which npm dist-tag each of those publishes under.

Decision: `0.1.0` and every pre-1.0 prerelease iteration publish on `latest`, because there is no stable release yet for a separate tag to protect consumers from.
Before 1.0, `latest` is the only install target.
Once `1.0.0` ships, later prereleases (for example `1.1.0-rc.0`) move onto `next`, so `latest` always resolves to the newest stable release and early adopters opt in with `@next`.

A prerelease is distinct from a preview.
A prerelease is a real, permanent npm version on a dist-tag, cut on the way to a stable release.
A preview is a throwaway build of a pull request, served by pkg.pr.new, which never publishes to npm and therefore never claims a dist-tag.
Nothing competes with `next`.

Consequence: Changesets' `pre` mode (`changeset pre enter next` / `changeset pre exit`) manages the alpha/beta/rc trains.
Entering `pre` mode is deferred until after `1.0.0` ships.
There is nothing to configure for it now.
