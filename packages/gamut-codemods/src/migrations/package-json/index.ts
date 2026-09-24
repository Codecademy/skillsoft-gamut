import type { FileMigration } from '../../lib/types';

/*
  Renames dependencies in package.json and pins them to
  manifest.targetVersions. Removed packages are replaced by the packages
  they bundled. Only touched fields are re-sorted; indentation and the
  trailing newline are kept.
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
  match: (file) => /(^|\/)package\.json$/.test(file),
  run({ source, manifest, warn, note }) {
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
          if (!(old in next)) next[old] = '*';
        }
        warn(
          `${field}: replaced '${removed}' with its individual packages. ${why}`
        );
        note(`removed:${removed}`);
        touched = true;
      }

      for (const [from, { to }] of Object.entries(manifest.packages)) {
        if (!(from in next)) continue;
        delete next[from];
        next[to] = manifest.targetVersions[to];
        touched = true;
      }

      if (touched) {
        pkg[field] = sortKeys(next);
        changed = true;
      }
    }

    if (!changed) return null;
    const trailing = source.endsWith('\n') ? '\n' : '';
    return JSON.stringify(pkg, null, detectIndent(source)) + trailing;
  },
};
