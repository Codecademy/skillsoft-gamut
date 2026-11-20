import { isNewerThan } from '../../lib/manifest';
import type { FileMigration } from '../../lib/types';

/*
  Renames dependencies in package.json and pins them to
  manifest.targetVersions. Removed packages are replaced by the packages
  they bundled. Only touched fields are re-sorted; indentation and the
  trailing newline are kept.

  A new package that's already listed keeps its value. People add the new
  names by hand before running this, often pointed at a preview tarball,
  and overwriting that with a range that isn't published yet breaks
  install. A `*` peer range stays `*`: it means "whatever the host has",
  and narrowing it is a decision for the package owner.

  A range newer than manifest.sourceVersions gets a warning: the code may
  already use APIs that only exist upstream, which no rename can fix.

  An app that depends on a package in manifest.requiredPeers also gets that
  peer, at the range the package declares, when it doesn't list one.
*/

const FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

const sortKeys = (obj: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))
  );

const detectIndent = (text: string) =>
  (text.match(/^[ \t]+(?=")/m) ?? ['  '])[0];

export const packageJson: FileMigration = {
  name: 'package-json',
  kind: 'file',
  description: 'Rename dependencies in package.json.',
  appliesTo: (file) => /(^|\/)package\.json$/.test(file),
  run({ source, manifest, warn, note, usesVideo }) {
    const pkg = JSON.parse(source) as Record<string, unknown>;
    let changed = false;

    for (const field of FIELDS) {
      const deps = pkg[field] as Record<string, string> | undefined;
      if (!deps) continue;
      const next = { ...deps };
      let touched = false;

      for (const [removed, { expandTo, note: why }] of Object.entries(
        manifest.removedPackages
      )) {
        if (!(removed in next)) continue;
        delete next[removed];
        for (const old of expandTo) {
          const renamed = manifest.packages[old]?.to;
          if (!(old in next) && !(renamed && renamed in next)) next[old] = '*';
        }
        warn(
          `${field}: replaced '${removed}' with its individual packages. ${why}`
        );
        note(`removed:${removed}`);
        touched = true;
      }

      for (const [from, { to }] of Object.entries(manifest.packages)) {
        if (!(from in next)) continue;
        const range = next[from];
        const covered = manifest.sourceVersions[from];
        if (covered && isNewerThan(range, covered)) {
          warn(
            `${field}: '${from}@${range}' is newer than ${covered}, the last release ${to} matches. Code written against the newer release may not type-check until ${to} catches up.`
          );
        }
        delete next[from];
        touched = true;
        if (to in next) continue;
        next[to] =
          field === 'peerDependencies' && range === '*'
            ? '*'
            : manifest.targetVersions[to];
      }

      if (touched) {
        pkg[field] = sortKeys(next);
        changed = true;
      }
    }

    /*
      Peers the new packages need at runtime but no longer install. Each is
      added once, to the first field that lists a package that needs it.
    */
    const listed = (name: string) =>
      FIELDS.some((field) => name in ((pkg[field] ?? {}) as object));
    const dependsOn = (deps: Record<string, string>, old: string) =>
      old in deps || (manifest.packages[old]?.to ?? old) in deps;
    for (const [name, { range, when, video }] of Object.entries(
      manifest.requiredPeers
    )) {
      if (listed(name)) continue;
      if (video && !usesVideo()) continue;
      const owner = (
        ['dependencies', 'peerDependencies', 'devDependencies'] as const
      ).find((field) => {
        const deps = pkg[field] as Record<string, string> | undefined;
        return deps !== undefined && when.some((old) => dependsOn(deps, old));
      });
      if (!owner) continue;
      pkg[owner] = sortKeys({
        ...(pkg[owner] as Record<string, string>),
        [name]: range,
      });
      note('required-peers');
      changed = true;
    }

    if (!changed) return null;
    const trailing = source.endsWith('\n') ? '\n' : '';
    return JSON.stringify(pkg, null, detectIndent(source)) + trailing;
  },
};
