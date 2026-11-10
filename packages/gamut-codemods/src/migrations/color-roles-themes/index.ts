import type { Edit, SpliceMigration } from '../../lib/types';
import type { ColorRolesManifest } from '../../presets/color-roles/manifest';
import { MARK, markedBefore } from '../color-roles/cssVars';

/*
  The old themes' names → the brand themes that replace them, wherever
  they're imported from gamut-styles:

  - `percipioTheme` → `skillsoftTheme`, its replacement (`percipioTheme` is
    removed), and the `PercipioTheme` type → `SkillsoftTheme`.
  - `coreTheme` → `originalCodecademyTheme`, its rebuild. `coreTheme` still
    exists but defines no roles, so components lose their colors on it.

  An aliased import (`percipioTheme as theme`) only has its imported name
  changed. An unaliased one is renamed everywhere the file uses it.

  The `CoreTheme` type has no same-named successor: brand themes share one
  shape, typed by `SkillsoftTheme`. It gets a `color-roles:` comment for a
  person, since it's usually a Theme augmentation the app owns.
*/

const RENAMES: Record<string, string> = {
  percipioTheme: 'skillsoftTheme',
  coreTheme: 'originalCodecademyTheme',
  PercipioTheme: 'SkillsoftTheme',
  PercipioThemeShape: 'SkillsoftThemeShape',
};

const MANUAL: Record<string, string> = {
  CoreTheme: `/* ${MARK} 'CoreTheme' types the old core theme, which has no color roles. Brand themes share one shape: use 'SkillsoftTheme', which types every brand (originalCodecademyTheme included). */ `,
};

const GAMUT_STYLES = /(^|\/)gamut-styles$/;

interface Node {
  type: string;
  start: number;
  end: number;
  [key: string]: any;
}

export const colorRolesThemes: SpliceMigration<ColorRolesManifest> = {
  name: 'color-roles-themes',
  kind: 'splice',
  description:
    'Rename percipioTheme and coreTheme to the brand themes that replace them.',
  edits({ j, root, source, warn, note }) {
    const edits: Edit[] = [];
    const seen = new Set<number>();
    const push = (e: Edit) => {
      if (seen.has(e.start)) return;
      seen.add(e.start);
      edits.push(e);
    };
    /* Unaliased imports, renamed across the file. */
    const local = new Map<string, string>();

    root.find(j.ImportDeclaration).forEach((p) => {
      const decl = p.node as unknown as Node;
      if (!GAMUT_STYLES.test(decl.source.value)) return;
      for (const spec of decl.specifiers ?? []) {
        if (spec.type !== 'ImportSpecifier') continue;
        const name: string = spec.imported?.name;
        const to = RENAMES[name];
        if (to) {
          push({
            start: spec.imported.start,
            end: spec.imported.end,
            text: to,
          });
          if (spec.local?.name === name) local.set(name, to);
          note('color-roles:themes');
        } else if (MANUAL[name]) {
          if (!markedBefore(source, spec.start)) {
            push({ start: spec.start, end: spec.start, text: MANUAL[name] });
          }
          warn(
            spec,
            `'${name}' types the old core theme, which has no color roles. Use 'SkillsoftTheme', which types every brand.`
          );
          note('color-roles:themes');
        }
      }
    });

    if (local.size === 0) return edits;

    /* `{ percipioTheme }` keeps its key: `{ percipioTheme: skillsoftTheme }`. */
    root.find(j.Node).forEach((p) => {
      const node = p.node as unknown as Node;
      if (
        (node.type === 'ObjectProperty' || node.type === 'Property') &&
        node.shorthand &&
        node.value?.type === 'Identifier' &&
        local.has(node.value.name)
      ) {
        push({
          start: node.start,
          end: node.end,
          text: `${node.value.name}: ${local.get(node.value.name)}`,
        });
      }
    });

    root.find(j.Identifier).forEach((p) => {
      const id = p.node as unknown as Node;
      const to = local.get(id.name);
      if (!to) return;
      const parent = p.parent?.node as Node | undefined;
      /* `x.percipioTheme` and `{ percipioTheme: … }` name something else. */
      if (
        parent &&
        (parent.type === 'MemberExpression' ||
          parent.type === 'OptionalMemberExpression') &&
        parent.property === p.node &&
        !parent.computed
      ) {
        return;
      }
      if (
        parent &&
        (parent.type === 'ObjectProperty' || parent.type === 'Property') &&
        parent.key === p.node &&
        !parent.computed
      ) {
        return;
      }
      push({ start: id.start, end: id.end, text: to });
    });

    return edits;
  },
};
