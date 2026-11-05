import type {
  Collection,
  ExportSpecifier,
  ImportDeclaration,
  ImportSpecifier,
  JSCodeshift,
} from 'jscodeshift';

import { renameSpecifier } from '../../lib/manifest';
import { findModuleStrings, nameOf } from '../../lib/module-strings';
import type { AstMigration } from '../../lib/types';

/*
  `@codecademy/gamut/dist/...` -> the public entry point from
  manifest.deepImports. Renamed exports keep their local name so call sites
  don't change: `import { List }` becomes `import { MenuList as List }`.
*/

const DIST = /^(@codecademy\/[\w-]+|eslint-plugin-gamut)\/dist(\/|$)/;

type Specifier = ImportSpecifier | ExportSpecifier | { type: string };

/*
  Specifiers are rebuilt rather than mutated. `import { List }` has imported
  and local sharing one source range, so recast's patcher drops the alias if
  you only swap `imported`.
*/
const renameSpecifiers = (
  j: JSCodeshift,
  specifiers: Specifier[],
  renames: Record<string, string>
) =>
  specifiers.map((spec) => {
    if (spec.type === 'ImportSpecifier') {
      const { imported, local, importKind } = spec as ImportSpecifier & {
        importKind?: string;
      };
      const next = renames[nameOf(imported)];
      if (!next) return spec;
      const renamed = j.importSpecifier(
        j.identifier(next),
        j.identifier(nameOf(local ?? imported))
      );
      Object.assign(renamed, { importKind });
      return renamed;
    }
    if (spec.type === 'ExportSpecifier') {
      const { local, exported } = spec as ExportSpecifier;
      const next = renames[nameOf(local)];
      if (!next) return spec;
      return j.exportSpecifier.from({
        local: j.identifier(next),
        exported: j.identifier(nameOf(exported ?? local)),
      });
    }
    return spec;
  });

/* Only plain `{ a, b as c }` imports can be merged; defaults and `* as` can't. */
const namedOnly = (node: ImportDeclaration) =>
  (node.specifiers ?? []).every((spec) => spec.type === 'ImportSpecifier');

/* Names the file already imports by name from `source`. */
const importedNamesFrom = (root: Collection, j: JSCodeshift, source: string) =>
  new Set(
    root
      .find(j.ImportDeclaration)
      .nodes()
      .filter((node) => node.source.value === source)
      .flatMap((node) =>
        (node.specifiers ?? [])
          .filter(
            (spec): spec is ImportSpecifier => spec.type === 'ImportSpecifier'
          )
          .map((spec) => nameOf(spec.imported))
      )
  );

const mergeKey = (node: ImportDeclaration) =>
  `${String(node.source.value)}\0${node.importKind ?? 'value'}`;

type NamedSpecifier = ImportSpecifier & { importKind?: string };

const specifierKey = (spec: NamedSpecifier) =>
  `${spec.importKind ?? 'value'} ${nameOf(spec.imported)} ${nameOf(
    spec.local ?? spec.imported
  )}`;

/*
  A rewritten deep import often lands on a package the file already
  imports from, and two declarations from one source trip
  import/no-duplicates. Fold each rewritten declaration into the first
  plain named import of the same source and kind. Declarations the file
  already had are never merged with each other.
*/
const mergeRewritten = (
  j: JSCodeshift,
  root: Collection,
  rewritten: Set<unknown>
) => {
  const targets = new Map<string, ImportDeclaration>();
  root.find(j.ImportDeclaration).forEach((p) => {
    const { node } = p;
    if (!namedOnly(node)) return;
    const key = mergeKey(node);
    const target = targets.get(key);
    if (!target) {
      targets.set(key, node);
      return;
    }
    if (!rewritten.has(node)) return;

    const existing = new Set(
      (target.specifiers as NamedSpecifier[]).map(specifierKey)
    );
    /* Clone into the target; recast's patcher can crash on moved nodes. */
    const moved = (node.specifiers as NamedSpecifier[])
      .filter((spec) => !existing.has(specifierKey(spec)))
      .map((spec) =>
        Object.assign(
          j.importSpecifier(
            j.identifier(nameOf(spec.imported)),
            j.identifier(nameOf(spec.local ?? spec.imported))
          ),
          { importKind: spec.importKind }
        )
      );
    target.specifiers = [...(target.specifiers ?? []), ...moved];
    j(p).remove();
  });
};

export const deepImports: AstMigration = {
  name: 'deep-imports',
  kind: 'ast',
  description: 'Rewrite /dist/ deep imports to public entry points.',
  run({ j, root, manifest, warn }) {
    const byPath = new Map(manifest.deepImports.map((row) => [row.from, row]));
    let changed = false;

    /* Declarations first, so renames can be applied to their specifiers. */
    const declarations = [
      ...root.find(j.ImportDeclaration).nodes(),
      ...root.find(j.ExportNamedDeclaration).nodes(),
      ...root.find(j.ExportAllDeclaration).nodes(),
    ];
    const handled = new Set<unknown>();
    const rewritten = new Set<unknown>();

    for (const node of declarations) {
      const source = node.source as { value?: unknown } | null | undefined;
      if (typeof source?.value !== 'string' || !DIST.test(source.value)) {
        continue;
      }
      handled.add(source);
      const row = byPath.get(source.value);
      if (!row) {
        warn(
          node,
          `unmapped deep import '${source.value}'. Add it to the preset manifest's deepImports.`
        );
        continue;
      }
      if (!row.to) {
        warn(
          node,
          `'${row.from}' has no public replacement. ${row.note ?? ''}`
        );
        continue;
      }
      if (row.onlyNames) {
        const allowed = new Set(row.onlyNames);
        const specifiers =
          'specifiers' in node ? ((node.specifiers ?? []) as Specifier[]) : [];
        const blocked = specifiers
          .map((spec) =>
            spec.type === 'ImportSpecifier'
              ? nameOf((spec as ImportSpecifier).imported)
              : spec.type === 'ExportSpecifier'
              ? nameOf((spec as ExportSpecifier).local)
              : '*'
          )
          .filter((name) => !allowed.has(name));
        if (node.type === 'ExportAllDeclaration') blocked.push('*');
        if (blocked.length > 0) {
          warn(
            node,
            `'${row.from}' is only partly public. ${blocked.join(
              ', '
            )} isn't exported from '${row.to}'. ${row.note ?? ''}`
          );
          /* Usually a name the file already imports from the public entry. */
          const alreadyImported = importedNamesFrom(root, j, row.to);
          const duplicates = blocked.filter((name) =>
            alreadyImported.has(name)
          );
          /* Warn with the names the run leaves behind, not the old scope. */
          const after = (value: string) =>
            renameSpecifier(manifest, value) ?? value;
          if (duplicates.length > 0) {
            warn(
              node,
              `${duplicates.join(', ')} is already imported from '${after(
                row.to
              )}' in this file, so this import duplicates it. Drop the '${after(
                row.from
              )}' import and use the '${after(row.to)}' one.`
            );
          }
          continue;
        }
      }
      if (row.renames && 'specifiers' in node && node.specifiers) {
        node.specifiers = renameSpecifiers(
          j,
          node.specifiers,
          row.renames
        ) as typeof node.specifiers;
      }
      node.source = j.stringLiteral(row.to);
      if (node.type === 'ImportDeclaration') rewritten.add(node);
      changed = true;
    }

    if (rewritten.size > 0) mergeRewritten(j, root, rewritten);

    /* Then mocks, require(), import(): only the string can change here. */
    for (const literal of findModuleStrings(j, root)) {
      if (handled.has(literal) || !DIST.test(literal.value)) continue;
      const row = byPath.get(literal.value);
      if (!row?.to) {
        warn(
          literal,
          `deep import '${literal.value}' in a mock or require() needs a manual rewrite.`
        );
        continue;
      }
      /* jest.mock of a deep path now mocks the whole package. */
      warn(
        literal,
        `rewrote '${literal.value}' to '${
          row.to
        }' in a mock or require(). That now covers the whole package${
          row.renames ? ', and some exports were renamed' : ''
        }. Check it by hand.`
      );
      literal.value = row.to;
      changed = true;
    }

    return changed;
  },
};
