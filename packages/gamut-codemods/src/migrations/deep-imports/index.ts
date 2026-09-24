import type {
  ExportSpecifier,
  ImportSpecifier,
  JSCodeshift,
} from 'jscodeshift';

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
      changed = true;
    }

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
