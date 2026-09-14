# ADR 0002: Documentation site packaging, URL topology, and deployment

- **Status:** Proposed
- **Date:** 2026-09-14
- **Amended:** 2026-09-14 — decisions 3–5 revised to deploy to the GitHub Pages project URL first and defer the custom domain; decisions 1–2 revised to sibling packages named for their roles (`packages/gamut-docs`) rather than an intermediate `packages/docs/` directory
- **Ticket:** GMT-1727
- **Deciders:** Gamut maintainers

## Context

[ADR 0001](0001-documentation-site-information-architecture.md) established that the documentation site is two systems by design: Starlight is the front door (tutorials, how-to, explanation) and Storybook is the reference engine (variants, props, playgrounds), with Starlight embedding live Storybook canvases via `StoryEmbed`. That ADR settled the information architecture but left the mechanics unaddressed: where the two projects live in the repo, what URLs they occupy, how a contributor runs them, and which repository deploys them.

The current state makes each of those questions urgent:

1. **Neither project is named for what it is.** `packages/starlight` (Astro 7 + Starlight, package `@codecademy/gamut-docs`, Nx project `starlight`) and `packages/styleguide` (Storybook 10.3.3, webpack5 builder, `@codecademy/styleguide`) sit beside twelve library packages, and the first is named after the framework it happens to use rather than the thing it is — with its directory, Nx project, and npm package all disagreeing. There is also no single command that starts both, so a contributor editing a component page cannot see its embedded story without starting a second server by hand.
2. **`StoryEmbed` points at production from localhost.** It hardcodes `storybookOrigin = 'https://gamut.codecademy.com'`, so local Starlight development renders iframes from the deployed site and cannot show local story changes at all.
3. **Deploys from this repository go nowhere.** `deploy-production.yml` assembles `dist/docs` and pushes a `gh-pages` branch, but GitHub Pages is not enabled on `Codecademy/skillsoft-gamut` (the API returns 404). The live `gamut.codecademy.com` is still served by `Codecademy/gamut`, whose Pages site reports `source: {branch: gh-pages, path: /docs}` and `build_type: legacy`.
4. **Jekyll will break Astro's output.** `build_type: legacy` means Pages runs Jekyll over the published branch, and Jekyll skips underscore-prefixed directories by default — including `_astro/`, where Astro emits all bundled CSS and JS.
5. **The target hostname does not exist, but a usable URL already does.** `gamut.skillsoft.com` has no DNS record of any kind, and provisioning it depends on a zone this team does not control: `gamut.codecademy.com` resolves to Cloudflare (`104.17.183.120`) rather than Pages' `185.199.x`, while `skillsoft.com` resolves to AWS CloudFront (`13.227.87.x`) — two different edges, likely two different owners. Meanwhile the Pages project URL `codecademy.github.io/skillsoft-gamut/` needs no DNS at all: `codecademy.github.io` returns a plain GitHub 404 with no redirect and no `Codecademy/codecademy.github.io` repository exists, so there is no org-level Pages site whose custom domain would hijack project-page URLs.
6. **Storybook URLs are baked into immutable npm tarballs.** `packages/gamut/package.json` lists `agent-tools` in its `files` array, so the 58 `gamut.codecademy.com` URLs across 25 agent-tools files ship inside every published `@codecademy/gamut` version and cannot be retroactively corrected.

## Decision

### 1. Both documentation projects are sibling packages, named for what they are

```text
packages/gamut-docs/     was packages/starlight
packages/styleguide/     unchanged
```

`packages/` is the shared parent. The two halves sit beside each other there, as siblings, exactly like every other package in the workspace — there is no intermediate `packages/docs/` directory and neither is nested inside the other.

Nesting was rejected on a concrete cost: `nx.json` defines `namedInputs.default` as `["{projectRoot}/**/*"]`, so putting Storybook inside the Starlight project root would make Starlight's input glob contain all 339 of Storybook's tracked files, and every story edit would invalidate Starlight's build cache and vice versa. An intermediate shared parent was rejected as redundant — `packages/` already supplies the shared parent, and adding a level buys a grouping that the names now carry on their own. Sibling directories keep the project roots disjoint and match ADR 0001's framing of the two systems as equals with different jobs rather than parent and child.

Two consequences of keeping both at the same depth, both simplifications relative to an intermediate directory:

- **No workspace glob change.** `workspaces.packages` is the single-level `["packages/*"]`, which already matches both.
- **No relative-path repairs.** `.storybook/main.ts` resolves seven package aliases by traversal (`resolve(__dirname, '../../gamut-styles/src')`); because `packages/styleguide` does not move, those depths stay correct. Under a nested or intermediate layout each would have needed an extra `../`, and missing one is a hard build failure.

### 2. Projects and packages are named to match their directories

| Directory             | Nx project   | npm package              |
| --------------------- | ------------ | ------------------------ |
| `packages/gamut-docs` | `gamut-docs` | `@codecademy/gamut-docs` |
| `packages/styleguide` | `styleguide` | `@codecademy/styleguide` |

The Starlight project was renamed from `starlight` to `gamut-docs` so that directory, Nx project, and npm package all agree; the package was already `@codecademy/gamut-docs`, so the directory and project names were the outliers. Renaming the directory without the Nx project would have left a project called `starlight` living at `packages/gamut-docs` with scripts reading `nx run starlight:build` — the same class of mismatch this decision exists to remove.

`packages/styleguide` keeps all three names. Its directory is not moving, so there is no forcing change to piggyback a rename onto, and renaming the project alone would reintroduce the directory/name mismatch just described.

Target names (`build-storybook`, `storybook`, `storybook-test`, `dev`, `build`) are unchanged, so CI invocations and contributor muscle memory survive.

The `gamut-docs` rename touched nine references across six files plus `yarn.lock`: `project.json` (`name`, `sourceRoot`, three `cwd` options), two root scripts (`build-docs-site`, `start:docs`), two `.gitignore` paths, the `editLink` base URL in `astro.config.mjs`, and the workspace resolution in `yarn.lock`. The 24 references to `styleguide` elsewhere in the workspace are untouched.

### 3. Starlight owns the site root; Storybook is served from `<base>/storybook/`

Starlight is mounted at the site root and Storybook one level beneath it, at `storybook/`. What that root _is_ changes over time, and the topology is defined relative to it rather than to a hostname:

```text
interim   codecademy.github.io/skillsoft-gamut/             Starlight
          codecademy.github.io/skillsoft-gamut/storybook/   Storybook

eventual  gamut.skillsoft.com/                              Starlight
          gamut.skillsoft.com/storybook/                    Storybook
```

The interim target is deliberate, not a fallback: it needs no DNS record, so the real topology becomes verifiable on real URLs while the record in open question 1 does not yet exist. Moving to the custom domain later is a configuration change (`base`, `site`, and re-adding `CNAME`), not a rebuild.

Under the interim target Astro must be configured with `site: 'https://codecademy.github.io'` and `base: '/skillsoft-gamut'`, which prefixes Astro's own emitted assets and Starlight's internal navigation. **Storybook needs no corresponding configuration at either target** — its build is document-relative (see below), so it is indifferent to how deep it is mounted.

Source layout, build output paths, and served URLs are three independent mappings — today Storybook's source is `packages/styleguide`, its output is `dist/storybook/styleguide`, and it is served at `/`. The deploy script is what binds them, so this URL topology is a property of deploy assembly, not of decision 1.

Serving Storybook from a subpath was verified against a real build rather than assumed. Storybook 10.3.3's static output is subpath-safe with no configuration: `index.html` references every asset as `./`-relative (`./sb-manager/runtime.js`, `./sb-addons/…`), no built HTML contains a root-absolute `src`/`href`, and the webpack runtime sets `__webpack_require__.p = ""`, which resolves chunk URLs relative to the requesting document. Served behind a placeholder root at `/storybook/`, all of `/storybook/`, `iframe.html`, `sb-manager/runtime.js`, `index.json`, `favicon.svg`, and a hashed runtime chunk returned 200. No `publicPath` override is needed.

Publishing Astro output additionally requires an empty `.nojekyll` file at the publish root to stop Jekyll from stripping `_astro/`, **and** the `-t` flag on `gh-pages`, which excludes dotfiles by default and would otherwise drop that file before it reaches the branch. The tracked `dist/static/storybook/index.html` stub — an empty `noindex` placeholder currently occupying `/storybook` — must be deleted, or the static overlay will overwrite the real Storybook index.

### 4. One relative URL form, with a dev-only redirect

Every reference to Storybook from the docs site — `StoryEmbed` iframes and prose links alike — is authored in a single root-relative form that names no hostname and no base path:

```text
/storybook/?path=/docs/foundations-typography--docs
/storybook/iframe.html?id=atoms-buttons-fillbutton--default
```

In development the two servers are separate origins (Starlight `:3333`, Storybook `:6006`), so a dev-only Vite middleware issues a 302 from `/storybook/*` to `http://localhost:6006/*`. The browser lands on Storybook's own origin and Storybook serves its own assets normally; nothing is proxied. This is the decisive property — proxying Storybook's dev _content_ under a subpath would require Starlight's root to also claim `/sb-manager/`, `/sb-preview/`, `/sb-addons/`, `/index.json`, and `/iframe.html`, a list that changes across Storybook versions.

Because decision 3's site root is a base path rather than a domain root, that authored form cannot be what ships. Astro prefixes its own assets and Starlight's internal navigation with `base`, but it does **not** rewrite hardcoded root-relative links in content — `/storybook/…` would resolve to `codecademy.github.io/storybook/…` and 404. A build-time remark plugin therefore prefixes root-relative links with `import.meta.env.BASE_URL`, and `StoryEmbed` reads the same value for its iframe `src`. The dev middleware mounts under the base accordingly (`/skillsoft-gamut/storybook/*` → `:6006/*`).

This keeps content base-agnostic, which is what makes the eventual move to `gamut.skillsoft.com` a one-line configuration change rather than a sweep across every content file. Hardcoding `/skillsoft-gamut/` into markdown instead would create exactly the migration debt this ADR is otherwise trying to avoid, and the three plain `.md` files could not opt out of it, since they cannot reference `BASE_URL` themselves.

A single authored form is what makes the other alternatives unnecessary. Three of the ten existing content links live in plain `.md` files (`foundations/typography.md`, `foundations/design-tokens.md`, `foundations/System Props/prop-groups.md`) which cannot import components, so any component-based or inline-`import.meta.env` approach leaves those three unsolved. The redirect covers iframes, `.mdx` links, and plain `.md` links with one authored form, and the plugin makes that form portable across deployment targets.

`build-storybook` gains `"dependsOn": ["^build"]`. It currently declares no dependencies and fails standalone with ten unresolved `@codecademy/variance` imports; only `deploy-production.yml`'s incidental ordering (`yarn build` immediately before it) makes it work today.

### 5. This repository is the source of truth and the deployment origin

`Codecademy/skillsoft-gamut` is canonical going forward. `Codecademy/gamut` moves to maintenance only — critical vulnerability fixes — and keeps serving `gamut.codecademy.com` from its existing Pages site.

Pages is enabled on this repository against `gh-pages` at `/docs` with **no custom domain**, serving the project URL from decision 3's interim target. The custom domain is deferred, not abandoned: when `gamut.skillsoft.com` is provisioned, it is adopted by re-adding `CNAME`, setting `base` back to `/`, pointing `site` at the new host, and enabling Enforce HTTPS once Pages has issued a certificate.

Provisioning that hostname is a single `CNAME` record delegating `gamut.skillsoft.com` to `codecademy.github.io`. The documentation site is public and open source, so it carries no requirement to sit behind Skillsoft's CloudFront edge the way the rest of `skillsoft.com` does; GitHub Pages terminates TLS itself with an automatically renewed Let's Encrypt certificate, and no distribution, origin configuration, or certificate management is needed. The one consequence of a bare delegation is that there is no edge in front of Pages capable of serving real HTTP redirects — so if link forwarding is ever wanted, it needs an edge introduced deliberately rather than assumed to exist.

Adopting the custom domain does not orphan the interim URL: once a custom domain is configured, GitHub redirects the project URL to it, so addresses bookmarked during the interim period continue to resolve.

**The tracked `dist/static/CNAME` must be deleted before Pages is enabled here, and the deletion must reach the branch.** This repository's `gh-pages` branch already carries `docs/CNAME` reading `gamut.codecademy.com` (last pushed 2026-09-11) — the deploy workflow has been running on every merge to `main` all along, with nothing serving the result. Enabling Pages while that file is present would have this repository contest the old repository's verified claim on the hostname that is currently live.

Because these are genuinely two repositories, both hostnames can eventually be live simultaneously, each with its own `CNAME`. GitHub's one-custom-domain-per-repository limit does not force a cutover and no mirror repository is needed.

The restructure (decisions 1–4) lands as a self-contained change verified locally. Enabling Pages follows separately but is no longer blocked on anything external, since the interim target needs no DNS record.

### 6. Old Storybook deep links are not rescued by a shim

Moving Storybook off the root would, in isolation, break the 52 baked `gamut.codecademy.com/?path=/<story>` URLs in a particularly bad way: `?path=` is a query string, so the path is `/`, and those URLs would resolve _successfully_ to Starlight's splash page with the query silently ignored. There is no 404 to intercept, so neither `404.html` nor Astro's path-based `redirects` config can catch them, and `jekyll-redirect-from` is unavailable because `.nojekyll` is required by decision 3.

No shim is added, for two reasons. First, decision 5 keeps `gamut.codecademy.com` served by the old repository, so those URLs continue resolving against the old Storybook at its root exactly as they do today — the breakage this would guard against does not occur. Second, the only mechanism that could rescue them on a static host is client-side JavaScript, which fails for the agents fetching these URLs with plain HTTP clients — the primary consumers of `agent-tools` — while appearing to work in a browser.

Instead, `agent-tools` URLs are repointed at Starlight pages once the new site is live, making Starlight the referenced front door per ADR 0001. **This creates a sequencing constraint: that repointing must land before `Codecademy/gamut`'s Pages site is ever disabled**, which is the moment the old URLs actually die.

The interim target of decision 3 constrains this further: **`agent-tools` URLs must not be repointed at `codecademy.github.io/skillsoft-gamut/`.** Anything written into `agent-tools` ships inside the next published `@codecademy/gamut` tarball and becomes immutable, so pointing them at a URL known to be temporary would recreate precisely the problem in context item 6. The repointing waits for the custom domain; until then the old `gamut.codecademy.com` URLs remain the ones in published packages, which decision 5 keeps working.

## Consequences

### Positive

- **The tree names the documentation system instead of grouping it.** `packages/gamut-docs` says what it is rather than which framework builds it, and directory, Nx project, and npm package finally agree. The two-system split of ADR 0001 stays legible without an extra directory level or any coupling of build caches.
- **One command starts both servers.** `nx run-many --target=dev --parallel=2` needs no new dependency; the repo has neither `concurrently` nor `npm-run-all` and does not need them.
- **Local development finally shows local stories.** Replacing the hardcoded production origin means an embedded canvas reflects the story file the contributor is editing, which was impossible before.
- **Storybook links are written once and work everywhere.** Authors write one relative path in `.md` or `.mdx` or a component, with no environment branch, no custom URL scheme, and nothing for a contributor to remember.
- **The subpath assumption is verified, not assumed.** The riskiest premise was tested against a real build before any file moved, so the fallback of a separate `storybook.` subdomain is not needed and `/storybook/` is known to work.
- **Both hostnames can coexist.** The two-repository topology removes the cutover pressure that a single repository's one-`CNAME` limit would have created, and gives the link repointing in decision 6 an open-ended grace period.
- **Deployment has no external blocker.** The interim project URL needs no DNS record, so the full topology — Starlight at a root, Storybook beneath it, Astro's `_astro/` surviving Jekyll — can be exercised on real URLs while the provisioning question is still unanswered. The riskiest parts of publishing get proven before a hostname is committed to.
- **Content is portable across deployment targets.** Because links are authored root-relative and prefixed at build time, adopting the custom domain later changes configuration only; no content file names the interim URL.

### Negative / risks

- **A rename still conflicts with open work.** 156 tracked files move under `packages/gamut-docs`, so any open branch touching the Starlight site will conflict. This is far smaller than the 339-file Storybook move an intermediate directory would have additionally required, and `packages/styleguide` is untouched. Mitigation: `git mv` so history and blame follow, and land it as one change rather than incrementally.
- **A hardcoded port in the dev middleware.** The 302 target `localhost:6006` must stay in sync with the `styleguide` project's `storybook` target `port` option, and if Storybook is not running the failure is a connection refusal rather than a clear message. Mitigation: read the port from a single shared constant; accepted as cheaper than the proxy alternative it replaces.
- **`astro preview` alone no longer represents production.** Previewing Starlight's own output 404s `/storybook` unless Storybook is assembled into it first, because the dev middleware does not exist in a built site. Mitigation: verify the assembled `dist/docs` with a static server rather than `astro preview`.
- **Publishing depends on two easily-lost details.** Dropping either `.nojekyll` or `gh-pages -t` ships Starlight with no styles or scripts, and neither failure is visible in the build logs. Mitigation: assert both in the deploy pipeline rather than relying on the files' continued presence.
- **Already-published deep links degrade eventually.** Decision 6 accepts that the baked URLs live only as long as the old repository's Pages site does, and their expiry is a manual sequencing obligation rather than something enforced by tooling. Mitigation: record the constraint in the retirement plan for `Codecademy/gamut`; note that the 52 URLs use a malformed shape (`?path=/docs-atoms-buttons-button--docs`, hyphen rather than the `?path=/docs/…` slash that Starlight's own content uses correctly), so they likely never resolved to the intended page.
- **Renaming costs a one-time relearn.** `yarn start:storybook` and `nx run styleguide:build-storybook` change names, so bookmarked commands and any external references break once. Mitigation: keep target names stable so only the project prefix changes.
- **The base-prefix plugin is load-bearing and silent when absent.** Without it, every root-relative content link 404s under a base path, and nothing in the build reports it. Mitigation: a link-resolution check in CI against the built output, rather than relying on review to catch an unprefixed link.
- **`robots.txt` becomes inert.** Robots files are only honored at a domain root, so the tracked `dist/static/robots.txt` has no effect at `/skillsoft-gamut/robots.txt`. Accepted: its current contents (`Disallow:`) permit everything, so nothing changes in practice — but crawl control is unavailable until the custom domain exists.
- **Two URL transitions instead of one.** The site's address changes once when the project URL goes live and again when the custom domain is adopted. Mitigation: the interim URL is deliberately kept out of published artifacts (decision 6) and out of content (decision 4), confining the churn to whoever has bookmarked it.
- **The interim URL is not a credible public identity.** A design system other teams are asked to link to should not be addressed as `codecademy.github.io/skillsoft-gamut/`. Mitigation: treat the interim target as a staging and verification address, and keep open question 1 active rather than letting the deferral become permanent by inertia.

## Open questions

1. **When `gamut.skillsoft.com` is created.** The mechanism is settled (decision 5: a bare `CNAME`, no edge), but the record does not exist yet and depends on whoever administers the `skillsoft.com` zone. This does not block deployment, since decision 3 ships to the project URL first. It does block the `agent-tools` repointing in decision 6, which must not be aimed at a temporary URL.
2. **Whether production stays on GitHub Pages.** This ADR assumes it does. Netlify is already wired for Storybook PR previews (`deploy-alpha.yml`, `NETLIFY_SITE_ID`, `packages/styleguide/netlify.toml`) and supports query-matching redirects, multiple custom domains, and no Jekyll interference, which would make several details above unnecessary. Not evaluated as a production target here.
3. **Build assembly order.** Starlight must land at `docs/` and Storybook at `docs/storybook/` without either build wiping the other; the current `deploy` script assumes a single `mv` of Storybook's output into `dist/docs`.

## Alternatives considered

1. **Nest Storybook inside the Starlight package.** Rejected: puts one Nx project root inside another, so Starlight's `{projectRoot}/**/*` default input swallows Storybook's 339 files and couples their caches. It also implies a subordination that ADR 0001's peer framing does not.
2. **Group both under an intermediate `packages/docs/` directory.** Rejected: `packages/` is already the shared parent, so the extra level restates in the tree what decision 2's names now carry, while requiring a `workspaces.packages` glob addition, a 339-file move of `packages/styleguide`, and an extra `../` on each of seven `.storybook/main.ts` aliases. The grouping was not worth those four changes once both packages were named for their roles.
3. **Proxy Storybook's dev content under `/storybook`.** Rejected: achieves dev/production URL parity, but requires Starlight's root to claim Storybook's root-absolute asset prefixes, a list that changes between Storybook versions. The 302 redirect obtains the same parity without it.
4. **Branch `StoryEmbed`'s origin on `import.meta.env.DEV`.** Rejected after initially being chosen: it resolves the iframes but not prose links, and the three plain-`.md` files cannot import a component at all, leaving two mechanisms and an unsolved gap.
5. **A remark plugin rewriting a custom `storybook:` URL scheme.** Rejected _as the addressing mechanism_: it cannot touch the `StoryEmbed` component, so it would be a second mechanism alongside one for iframes, and a custom scheme is one contributors must learn and that editors and link checkers report as broken. Note that decision 4 does adopt a remark plugin for a narrower job — prefixing ordinary root-relative links with `BASE_URL` — which requires no custom scheme and leaves links valid to external tooling.
6. **A client-side query-parameter shim on Starlight's root.** Rejected: the only static-host mechanism able to rescue `?path=` URLs, but it requires JavaScript execution and therefore fails for the agent HTTP clients that are these URLs' main consumer, while appearing to work in a browser. Decision 5 also removes the need.
7. **Serve Storybook from its own subdomain** (`storybook.gamut.skillsoft.com`). Rejected: eliminates subpath risk, but verification showed there is no subpath risk to eliminate, and it abandons the `/storybook` route.
8. **Keep Storybook at the root and mount Starlight at `/docs`.** Rejected: preserves every existing deep link with no shim, but contradicts ADR 0001's designation of Starlight as the front door.
9. **Adopt `gamut.skillsoft.com` from the start and wait for DNS before deploying anything.** Rejected: it avoids a base path, a prefix plugin, and a second URL transition, but makes the entire publishing path — Jekyll bypass, two-build assembly, subpath serving — unverifiable until a record in a zone this team does not control is created. The interim project URL exercises all of it immediately at the cost of configuration that is designed to be reverted.
10. **Hardcode `/skillsoft-gamut/` into content links rather than prefixing at build time.** Rejected: simpler by one plugin, but bakes the interim deployment target into every content file, including three plain `.md` files that could not opt out, converting the eventual domain adoption from a config change into a content migration.

## References

- ADR 0001: [Information architecture for the new Gamut documentation site](0001-documentation-site-information-architecture.md)
- Diátaxis framework: <https://diataxis.fr>
- GitHub Pages Jekyll bypass (`.nojekyll`): <https://docs.github.com/pages/getting-started-with-github-pages/about-github-pages>
- Starlight source: `packages/gamut-docs` · Storybook source: `packages/styleguide`
- Deploy pipeline: `.github/workflows/deploy-production.yml`, root `deploy` script, `dist/static/`
