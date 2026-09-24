/*
  The shape of a preset's manifest: the data describing what changed. Most
  contributions should only add rows to a preset's manifest.ts plus a
  fixture; migrations read from here and never hardcode package or export
  names.
*/

export interface PackageRename {
  to: string;
}

export interface RemovedPackage {
  /* Old package names to depend on instead, in package.json. */
  expandTo: string[];
  /* Old package names to share as singletons in Module Federation config. */
  mfSharedAs: string[];
  note: string;
}

export interface MovedExport {
  from: string;
  to: string;
  names: string[];
  note: string;
}

export interface DeepImport {
  from: string;
  /* null when there's no public replacement; the migration warns instead. */
  to: string | null;
  /* Old imported name -> new exported name. Local bindings are kept. */
  renames?: Record<string, string>;
  note?: string;
}

export interface Manifest {
  /* Old package -> new package. */
  packages: Record<string, PackageRename>;
  /* Packages with no replacement under the new name. */
  removedPackages: Record<string, RemovedPackage>;
  /* Version range written to package.json, keyed by NEW package name. */
  targetVersions: Record<string, string>;
  movedExports: MovedExport[];
  deepImports: DeepImport[];
  /* ESLint plugin prefix, for rule keys, `plugin:` extends, and comments. */
  eslintPlugin: { from: string; to: string };
}

/*
  Match a specifier against a package name, exact or with a subpath.
  '@codecademy/gamut' matches '@codecademy/gamut/Video' but not
  '@codecademy/gamut-styles'. Returns the subpath ('' or '/Video') or null.
*/
export const matchPackage = (specifier: string, pkg: string) => {
  if (specifier === pkg) return '';
  if (specifier.startsWith(`${pkg}/`)) return specifier.slice(pkg.length);
  return null;
};

/* The new name for an old specifier, keeping any subpath. */
export const renameSpecifier = (manifest: Manifest, value: string) => {
  for (const [from, { to }] of Object.entries(manifest.packages)) {
    const subpath = matchPackage(value, from);
    if (subpath !== null) return to + subpath;
  }
  return null;
};

export const removedPackageFor = (manifest: Manifest, value: string) =>
  Object.keys(manifest.removedPackages).find(
    (pkg) => matchPackage(value, pkg) !== null
  );
