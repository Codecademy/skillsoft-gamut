# Gamut Release

A CLI tool for publishing prerelease versions (alpha, next, and eventually beta) of packages in the gamut repo using Nx release.

Mainly meant to be run in CI.

## Overview

This tool automates the process of publishing prerelease versions of packages in the gamut repo, matching the `main -> beta -> production` branch flow:

- **alpha**: published per-PR, tagged uniquely per commit (see `publish-alpha.yml`)
- **next**: published on every merge to `main`, tagged with a single stable `next` dist-tag (see `publish-next.yml`)
- **beta**: published on every merge to `beta`, tagged with a single stable `beta` dist-tag (see `publish-beta.yml`)

All three flows share this same script and Nx target; only the `--preid` and `--tag` differ. `production` (real releases, `latest` tag) is handled separately by `nx release` directly in `publish-production.yml`, not by this tool.

CI is responsible for validating the presence of a version plan before running these publishes.

## Usage

### Publishing a prerelease

```bash
npx nx run gamut-release:publish --preid=alpha.abc123
```

By default the npm dist-tag matches `--preid` (this is what alpha relies on, since every PR build needs its own unique installable tag). Pass `--tag` explicitly to publish under a stable tag instead, e.g. for `next`:

```bash
npx nx run gamut-release:publish --preid=next.abc123 --tag=next
```

### Manifest output (optional)

```bash
npx nx run gamut-release:publish --preid=alpha.abc123 --manifest[=path]
```
