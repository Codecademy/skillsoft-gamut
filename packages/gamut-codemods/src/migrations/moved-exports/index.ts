import type {
  ASTPath,
  Collection,
  ExportNamedDeclaration,
  ExportSpecifier,
  ImportDeclaration,
  ImportSpecifier,
  JSCodeshift,
} from 'jscodeshift';

import type { Manifest, MovedExport } from '../../lib/manifest';
import { nameOf } from '../../lib/module-strings';
import type { AstMigration, Warn } from '../../lib/types';

/*
  Moves named exports that left a package root onto their new subpath, per
  manifest.movedExports. For scope-swap that's Video and VideoProps:

    import { Box, Video } from '@codecademy/gamut';
  becomes
    import { Box } from '@codecademy/gamut';
    import { Video } from '@codecademy/gamut/Video';

  Shapes it can't rewrite safely (namespace imports, `export *`, mock
  factories) get a warning instead.
*/

type Declaration = ImportDeclaration | ExportNamedDeclaration;
type NamedSpecifier = ImportSpecifier | ExportSpecifier;

const isNamed = (spec: { type: string }): spec is NamedSpecifier =>
  spec.type === 'ImportSpecifier' || spec.type === 'ExportSpecifier';

const specName = (spec: NamedSpecifier) =>
  nameOf(spec.type === 'ImportSpecifier' ? spec.imported : spec.local);

const kindOf = (node: Declaration) =>
  (node as { importKind?: string; exportKind?: string }).importKind ??
  (node as { exportKind?: string }).exportKind ??
  'value';

/*
  Fresh copies, not the original nodes. Reparenting nodes that still carry
  their source location trips recast's patcher when the file has other edits.
*/
const cloneSpecifier = (j: JSCodeshift, spec: NamedSpecifier) => {
  if (spec.type === 'ExportSpecifier') {
    return j.exportSpecifier.from({
      local: j.identifier(nameOf(spec.local)),
      exported: j.identifier(nameOf(spec.exported ?? spec.local)),
    });
  }
  const copy = j.importSpecifier(
    j.identifier(nameOf(spec.imported)),
    j.identifier(nameOf(spec.local ?? spec.imported))
  );
  Object.assign(copy, {
    importKind: (spec as { importKind?: string }).importKind,
  });
  return copy;
};

/* An existing all-named declaration of the same kind we can merge into. */
const findTarget = (
  j: JSCodeshift,
  root: Collection,
  node: Declaration,
  to: string,
  kind: string
): Declaration | undefined => {
  const matches = (candidate: Declaration) =>
    kindOf(candidate) === kind &&
    (candidate.specifiers ?? []).every((s) => isNamed(s));
  return node.type === 'ImportDeclaration'
    ? root
        .find(j.ImportDeclaration, { source: { value: to } })
        .nodes()
        .find(matches)
    : root
        .find(j.ExportNamedDeclaration, { source: { value: to } })
        .nodes()
        .find(matches);
};

const moveSpecifiers = (
  j: JSCodeshift,
  root: Collection,
  path: ASTPath<Declaration>,
  rule: MovedExport
) => {
  const { node } = path;
  const names = new Set(rule.names);
  const specifiers = (node.specifiers ?? []) as { type: string }[];
  const matched = specifiers.filter(
    (s): s is NamedSpecifier => isNamed(s) && names.has(specName(s))
  );
  if (matched.length === 0) return false;

  const moving = matched.map((s) => cloneSpecifier(j, s));
  const staying = specifiers.filter(
    (s) => !matched.includes(s as NamedSpecifier)
  );
  const kind = kindOf(node);
  const existing = findTarget(j, root, node, rule.to, kind);

  if (existing) {
    (existing.specifiers as unknown[]).push(...moving);
    if (staying.length === 0) path.prune();
    else node.specifiers = staying as typeof node.specifiers;
    return true;
  }

  if (staying.length === 0) {
    /* Whole declaration moves. Keep the node so its comments stay put. */
    node.source = j.stringLiteral(rule.to);
    return true;
  }

  const created =
    node.type === 'ImportDeclaration'
      ? j.importDeclaration(
          moving as ImportSpecifier[],
          j.stringLiteral(rule.to)
        )
      : j.exportNamedDeclaration(
          null,
          moving as ExportSpecifier[],
          j.stringLiteral(rule.to)
        );
  Object.assign(
    created,
    node.type === 'ImportDeclaration'
      ? { importKind: kind }
      : { exportKind: kind }
  );
  node.specifiers = staying as typeof node.specifiers;
  path.replace(node, created);
  return true;
};

const warnAboutUnsafeShapes = (
  j: JSCodeshift,
  root: Collection,
  rule: MovedExport,
  warn: Warn
) => {
  const list = rule.names.join('/');

  root
    .find(j.ImportDeclaration, { source: { value: rule.from } })
    .forEach((p) => {
      for (const spec of p.node.specifiers ?? []) {
        if (spec.type !== 'ImportNamespaceSpecifier') continue;
        const ns = nameOf(spec.local);
        const member = root
          .find(j.MemberExpression, { object: { name: ns } })
          .filter((m) => rule.names.includes(nameOf(m.node.property)));
        const qualified = root
          .find(j.TSQualifiedName, { left: { name: ns } })
          .filter((q) => rule.names.includes(nameOf(q.node.right)));
        if (member.size() + qualified.size() > 0) {
          warn(
            p.node,
            `namespace import uses ${list}, which moved to '${rule.to}'. Rewrite by hand.`
          );
        }
      }
    });

  root
    .find(j.ExportAllDeclaration, { source: { value: rule.from } })
    .forEach((p) => {
      warn(
        p.node,
        `'export *' from '${rule.from}' no longer re-exports ${list}. Add an export from '${rule.to}' if you need them.`
      );
    });

  root
    .find(j.CallExpression, { arguments: [{ value: rule.from }] })
    .filter((p) => p.node.arguments.length > 1)
    .forEach((p) => {
      const mentions = j(p.get('arguments', 1))
        .find(j.Identifier)
        .filter((id) => rule.names.includes(id.node.name));
      if (mentions.size() > 0) {
        warn(
          p.node,
          `mock of '${rule.from}' stubs ${list}. Mock '${rule.to}' instead.`
        );
      }
    });
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/* An old specifier and its renamed form, since scope-rename may have run. */
const bothScopes = (manifest: Manifest, spec: string) => {
  const pkg = Object.keys(manifest.packages).find(
    (p) => spec === p || spec.startsWith(`${p}/`)
  );
  return pkg
    ? [spec, manifest.packages[pkg].to + spec.slice(pkg.length)]
    : [spec];
};

export const movedExports: AstMigration = {
  name: 'moved-exports',
  kind: 'ast',
  description:
    'Move exports that left a package root (e.g. Video) to their new subpath.',
  run({ j, root, manifest, warn }) {
    let changed = false;
    for (const rule of manifest.movedExports) {
      const paths = [
        ...root
          .find(j.ImportDeclaration, { source: { value: rule.from } })
          .paths(),
        ...root
          .find(j.ExportNamedDeclaration, { source: { value: rule.from } })
          .paths(),
      ] as ASTPath<Declaration>[];
      for (const p of paths) {
        changed = moveSpecifiers(j, root, p, rule) || changed;
      }
      warnAboutUnsafeShapes(j, root, rule, warn);
    }
    return changed;
  },
  /*
    recast copies the gap that followed the original declaration onto the
    new one, so a split can leave a blank line between the two halves.
    Close exactly that gap and nothing else.
  */
  postPrint(source, { manifest }) {
    return manifest.movedExports.reduce((out, rule) => {
      const from = bothScopes(manifest, rule.from).map(escape).join('|');
      const to = bothScopes(manifest, rule.to).map(escape).join('|');
      const split = new RegExp(
        `(from '(?:${from})';?)\\n\\n((?:import|export)[^\\n]*from '(?:${to})';?)`,
        'g'
      );
      return out.replace(split, '$1\n$2');
    }, source);
  },
};
