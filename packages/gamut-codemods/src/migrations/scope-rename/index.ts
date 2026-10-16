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

  Package names in comments (JSDoc `@see`, usage examples) are renamed as
  well. `/dist` paths and removed packages are left for the leftovers
  report, since there's no name that's right for them.
*/

interface CommentNode {
  value: string;
  start: number;
  end: number;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/* Old names, not part of a longer name and not followed by `/dist`. */
const commentPattern = (from: string[]) =>
  new RegExp(
    `(?<![\\w@/-])(?:${from
      .sort((a, b) => b.length - a.length)
      .map(escape)
      .join('|')})(?![\\w-])(?!/dist(?![\\w-]))`,
    'g'
  );

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

    const pattern = commentPattern(Object.keys(manifest.packages));
    const seen = new Set<number>();
    /* j.Comment paths point at the owning node, so walk node.comments. */
    root.find(j.Node).forEach((p) => {
      const comments = (p.node as { comments?: CommentNode[] }).comments ?? [];
      for (const comment of comments) {
        if (seen.has(comment.start)) continue;
        seen.add(comment.start);
        for (const match of comment.value.matchAll(pattern)) {
          const next = manifest.packages[match[0]]?.to;
          if (!next) continue;
          /* +2 skips the `//` or `/*` that `value` leaves out. */
          const start = comment.start + 2 + (match.index ?? 0);
          edits.push({ start, end: start + match[0].length, text: next });
        }
      }
    });

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
