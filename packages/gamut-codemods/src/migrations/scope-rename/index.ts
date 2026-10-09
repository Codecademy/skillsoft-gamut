import { removedPackageFor, renameSpecifier } from '../../lib/manifest';
import type { StringNode } from '../../lib/module-strings';
import { findModuleStrings, isStringLiteral } from '../../lib/module-strings';
import type { Edit, SpliceMigration } from '../../lib/types';

/*
  Swaps old package names for new ones in every module position: imports,
  exports, require, mocks, `declare module`, import types. Runs last, since
  every other migration is written against the old names.

  Any other string that exactly names an old package (Next's
  transpilePackages, Module Federation shared keys, lint ignore lists) is
  rewritten too. Across mono, platform, front, and talent-intelligence every
  one of those was a correct rename, so they get one warning per file
  asking for a look at the diff, not one per string.

  This is a splice migration: it edits the text inside the quotes and never
  asks recast to print. Mutating even one literal's value made recast
  reprint neighbouring statements in semicolon-less files, including JSX
  text whitespace.
*/

export const scopeRename: SpliceMigration = {
  name: 'scope-rename',
  kind: 'splice',
  description: 'Swap old package specifiers for their new names.',
  edits({ j, root, manifest, warn }) {
    const edits: Edit[] = [];
    const moduleStrings = new Set(findModuleStrings(j, root));
    const outsideImports: string[] = [];

    const visit = (literal: StringNode, inModulePosition: boolean) => {
      const removed = removedPackageFor(manifest, literal.value);
      if (removed) {
        warn(
          literal,
          `'${removed}' has no replacement package. ${manifest.removedPackages[removed].note}`
        );
        return;
      }
      const next = renameSpecifier(manifest, literal.value);
      if (!next) return;
      if (!inModulePosition) outsideImports.push(literal.value);
      /* Inside the quotes only, so the file's quote style survives. */
      edits.push({
        start: literal.start + 1,
        end: literal.end - 1,
        text: next,
      });
    };

    for (const literal of moduleStrings) visit(literal, true);

    root
      .find(j.Node)
      .filter((p) => isStringLiteral(p.node) && !moduleStrings.has(p.node))
      .forEach((p) => visit(p.node as StringNode, false));

    if (outsideImports.length > 0) {
      const names = [...new Set(outsideImports)].join(', ');
      warn(
        null,
        `renamed ${outsideImports.length} package-name string(s) outside imports (${names}). Check the diff.`
      );
    }

    return edits;
  },
};
