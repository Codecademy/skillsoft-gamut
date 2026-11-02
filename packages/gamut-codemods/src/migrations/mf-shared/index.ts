import { isStringLiteral } from '../../lib/module-strings';
import type { Edit, SpliceMigration } from '../../lib/types';

/*
  Module Federation `shared` config that names a removed package:

    shared: { '@codecademy/gamut-kit': { singleton: true } }
  becomes
    shared: {
      '@codecademy/gamut': { singleton: true },
      '@codecademy/gamut-styles': { singleton: true },
      ...
    }

  Handles `const shared = { ... }` the same way.

  MF matches shared entries by import name, and code imports the individual
  packages, not the kit. So the old entry never deduped anything, and after
  this Gamut really is a singleton across host and remotes. That's a runtime
  change, hence the warning and checklist item. scope-rename runs after this
  and swaps the scope on the new keys.
*/

const keyName = (key: any): string | null => {
  if (!key) return null;
  if (key.type === 'Identifier') return key.name;
  if (isStringLiteral(key)) return key.value;
  return null;
};

/*
  The object in `shared: { ... }` (inline plugin options) or
  `const shared = { ... }` (declared, then passed in).
*/
const sharedObject = (node: any) => {
  if (
    (node.type === 'ObjectProperty' || node.type === 'Property') &&
    keyName(node.key) === 'shared' &&
    node.value?.type === 'ObjectExpression'
  ) {
    return node.value;
  }
  if (
    node.type === 'VariableDeclarator' &&
    keyName(node.id) === 'shared' &&
    node.init?.type === 'ObjectExpression'
  ) {
    return node.init;
  }
  return null;
};

export const mfShared: SpliceMigration = {
  name: 'mf-shared',
  kind: 'splice',
  description:
    'Replace removed packages in Module Federation `shared` config with the packages they bundled.',
  edits({ j, root, source, manifest, warn, note }) {
    const edits: Edit[] = [];

    root
      .find(j.Node)
      .filter((p) => sharedObject(p.node) !== null)
      .forEach((p) => {
        const shared = sharedObject(p.node);
        const existing = new Set(
          shared.properties.map((prop: any) => keyName(prop.key))
        );

        for (const prop of shared.properties) {
          const removed = manifest.removedPackages[keyName(prop.key) ?? ''];
          if (!removed) continue;

          const lineStart = source.lastIndexOf('\n', prop.start) + 1;
          const before = source.slice(lineStart, prop.start);
          /* One entry per line if the old one had its own line, else inline. */
          const ownLine = /^\s*$/.test(before);
          const separator = ownLine ? `,\n${before}` : ', ';
          const value = source.slice(prop.value.start, prop.value.end);
          const additions = removed.mfSharedAs.filter(
            (pkg) => !existing.has(pkg)
          );
          const text = additions
            .map((pkg) => `'${pkg}': ${value}`)
            .join(separator);

          /* Nothing to add: drop the entry and the comma that follows it. */
          const end =
            text || source[prop.end] !== ','
              ? prop.end
              : prop.end +
                1 +
                (source.slice(prop.end + 1).match(/^\s*/)?.[0].length ?? 0);
          edits.push({
            start: text || !ownLine ? prop.start : lineStart,
            end,
            text,
          });

          warn(
            prop,
            `replaced '${keyName(
              prop.key
            )}' in Module Federation shared config. Gamut is now actually shared as a singleton; test the host and remotes together.`
          );
          note('mf-shared');
        }
      });

    return edits;
  },
};
