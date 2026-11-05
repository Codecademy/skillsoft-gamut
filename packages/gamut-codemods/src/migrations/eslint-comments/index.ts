import { findFlatEslintConfig } from '../../lib/eslint';
import type { Edit, SpliceMigration } from '../../lib/types';

/*
  `// eslint-disable-next-line gamut/no-inline-style` ->
  `// eslint-disable-next-line @skillsoft/gamut/no-inline-style`.
  Rule names are unchanged; only the plugin prefix moves.

  Legacy .eslintrc only, to match eslint-config. With a flat config the
  prefix stays whatever key the plugin is registered under, so renamed
  directives would name a rule that doesn't exist ("Definition for rule
  ... was not found") and stop suppressing the real one.
*/

const DIRECTIVE = /^\s*(eslint-disable|eslint-enable|eslint\s)/;

interface CommentNode {
  type: string;
  value: string;
  start: number;
  end: number;
}

const isBlock = (comment: CommentNode) =>
  comment.type === 'CommentBlock' || comment.type === 'Block';

export const eslintComments: SpliceMigration = {
  name: 'eslint-comments',
  kind: 'splice',
  description:
    'Update ESLint directive comments to the new plugin rule prefix.',
  skipReason(roots) {
    const config = findFlatEslintConfig(roots);
    return config
      ? `found flat ESLint config ${config}; directive prefixes follow its plugins key, so they're left as is.`
      : null;
  },
  edits({ j, root, manifest }) {
    const { from, to } = manifest.eslintPlugin;
    /* The prefix at the start of a rule name, not one already scoped. */
    const prefix = new RegExp(`(^|[\\s,])${from}/`, 'g');
    const edits: Edit[] = [];
    const seen = new Set<number>();

    /* j.Comment paths point at the owning node, so walk node.comments. */
    root.find(j.Node).forEach((p) => {
      const comments = (p.node as { comments?: CommentNode[] }).comments ?? [];
      for (const comment of comments) {
        if (seen.has(comment.start)) continue;
        seen.add(comment.start);
        if (!DIRECTIVE.test(comment.value)) continue;
        const value = comment.value.replace(prefix, `$1${to}/`);
        if (value === comment.value) continue;
        const text = isBlock(comment) ? `/*${value}*/` : `//${value}`;
        edits.push({ start: comment.start, end: comment.end, text });
      }
    });

    return edits;
  },
};
