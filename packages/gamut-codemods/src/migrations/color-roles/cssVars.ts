import type {
  ColorAlias,
  ColorRolesManifest,
} from '../../presets/color-roles/manifest';
import { isAutomatic } from '../../presets/color-roles/manifest';

export const MARK = 'color-roles:';

/* "'background' splits into surface-raised | surface-default. <rule>" */
export const describe = (name: string, { kind, to, rule }: ColorAlias) => {
  const roles = to.join(' | ');
  const what =
    kind === 'split'
      ? `splits into ${roles}`
      : kind === 'retire'
      ? `is retired${roles ? ` (closest: ${roles})` : ''}`
      : 'is pending';
  return `'${name}' ${what}. ${rule}`;
};

/* The same, safe inside a block comment. */
export const commentText = (name: string, alias: ColorAlias) =>
  `/* ${MARK} ${describe(name, alias).replace(/\*\//g, '* /')} */ `;

/* Already marked by an earlier run: a color-roles comment right before `at`. */
export const markedBefore = (text: string, at: number) => {
  const before = text.slice(0, at).trimEnd();
  if (!before.endsWith('*/')) return false;
  const open = before.lastIndexOf('/*');
  return open !== -1 && before.slice(open).includes(MARK);
};

/*
  An old color variable: `--color-<name>`. The new prefix is `--colors-`, so
  a rewritten name never matches again.
*/
const OLD_VAR = /--color-([A-Za-z0-9][\w-]*)/g;

export const mentionsOldVar = (text: string) =>
  /--color-[A-Za-z0-9]/.test(text);

export interface VarHit {
  /* Offset of `--color-…` in the text. */
  at: number;
  name: string;
  /* The role it becomes, for renames and merges. */
  role?: string;
  /* Design's row, for splits, retirements and pending names. */
  alias?: ColorAlias;
  /* An old palette color (navy-800): no role replaces it by name. */
  palette?: boolean;
}

/* Every old color variable in `text` the manifest knows about. */
export const findOldVars = (
  text: string,
  manifest: ColorRolesManifest
): VarHit[] => {
  const palette = new Set(manifest.oldPalette);
  const hits: VarHit[] = [];
  for (const m of text.matchAll(OLD_VAR)) {
    const name = m[1];
    const alias = manifest.aliases[name];
    if (alias) {
      hits.push(
        isAutomatic(alias)
          ? { at: m.index, name, role: alias.to[0] }
          : { at: m.index, name, alias }
      );
    } else if (palette.has(name)) {
      hits.push({ at: m.index, name, palette: true });
    }
  }
  return hits;
};

export const paletteMessage = (name: string) =>
  `'--color-${name}' is an old palette color with no role of its own. Pick the role from design's component map (gamut-styles colorSystem/migration.ts, COMPONENTS).`;
