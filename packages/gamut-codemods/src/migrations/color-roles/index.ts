import type { Edit, SpliceMigration } from '../../lib/types';
import type { ColorRolesManifest } from '../../presets/color-roles/manifest';
import { isAutomatic } from '../../presets/color-roles/manifest';
import {
  commentText,
  describe,
  findOldVars,
  MARK,
  markedBefore,
  mentionsOldVar,
  paletteMessage,
} from './cssVars';

/*
  Today's Gamut color names → roles, wherever a color name sits:

  - a color prop in JSX (`bg="background-primary"`) or in a style object
    (`css`, `variant`, `states`, plain objects), including the branches of a
    ternary or `&&`, and responsive objects and arrays;
  - `theme.colors.text` / `theme.colors['text-disabled']`;
  - `themed('colors.primary')`;
  - `var(--color-text)` inside a string or template literal, which becomes
    `var(--color-text-default)` (stylesheets are the
    color-roles-stylesheets migration);
  - Card's `variant`, onto design's `default` and `brand`.

  Rename and merge rows are applied. Split, retire and pending rows need a
  person: the name stays (so it still fails the type check) and a
  `/* color-roles: … *\/` comment with design's rule goes in front of it.
  Old palette names (navy, hyper-500) and names built at runtime
  (`${variant}-hover`) only warn. Anything outside those positions, like a
  name in a const that's passed to `bg` later, isn't seen.
*/

/*
  Card's variants are design's two: white, beige and navy
  become `default`; yellow and hyper become `brand`.
*/
const CARD_VARIANTS: Record<string, string> = {
  white: 'default',
  beige: 'default',
  navy: 'default',
  yellow: 'brand',
  hyper: 'brand',
};

const NAVY_CARD = `/* ${MARK} Card's 'navy' variant becomes 'default' (surface-raised), which renders light. If this card should stay dark, wrap it in <ColorMode mode="dark">. */ `;

const GAMUT = /(^|\/)gamut$/;

/* Babel AST nodes, loosely: positions plus whatever the type carries. */
interface Node {
  type: string;
  start: number;
  end: number;
  loc?: { start: { line: number } } | null;
  [key: string]: any;
}

const isString = (n: Node | null | undefined): n is Node & { value: string } =>
  !!n &&
  (n.type === 'StringLiteral' ||
    (n.type === 'Literal' && typeof n.value === 'string'));

const keyName = (prop: Node): string | undefined => {
  if (prop.computed) return undefined;
  const { key } = prop;
  if (key?.type === 'Identifier') return key.name;
  if (isString(key)) return key.value;
  return undefined;
};

/* `theme.colors` or `<anything>.theme.colors`. */
const isThemeColors = (n: Node | null | undefined) =>
  !!n &&
  (n.type === 'MemberExpression' || n.type === 'OptionalMemberExpression') &&
  !n.computed &&
  n.property?.name === 'colors' &&
  ((n.object?.type === 'Identifier' && n.object.name === 'theme') ||
    (n.object?.type?.endsWith('MemberExpression') &&
      !n.object.computed &&
      n.object.property?.name === 'theme'));

export const colorRoles: SpliceMigration<ColorRolesManifest> = {
  name: 'color-roles',
  kind: 'splice',
  description:
    'Rename Gamut color names to roles; mark splits, retirements and pending names with design’s rule.',
  edits({ j, root, source, manifest, warn, note }) {
    const props = new Set(manifest.colorProps);
    const palette = new Set(manifest.oldPalette);
    const edits: Edit[] = [];
    const seen = new Set<number>();

    const marked = (at: number) => markedBefore(source, at);

    const mark = (at: number, name: string) => {
      const alias = manifest.aliases[name];
      if (!marked(at)) {
        edits.push({
          start: at,
          end: at,
          text: commentText(name, alias),
        });
      }
    };

    /*
      One color name. `replace` swaps it for a role; `markAt` is where a
      comment can go (in front of a JSX attribute, not inside it).
    */
    const visit = (
      node: Node,
      name: string,
      replace: (role: string) => Edit,
      markAt: number
    ) => {
      if (seen.has(node.start)) return;
      seen.add(node.start);
      const alias = manifest.aliases[name];
      if (alias) {
        if (isAutomatic(alias)) {
          edits.push(replace(alias.to[0]));
        } else {
          mark(markAt, name);
          warn(node, describe(name, alias));
          note('color-roles:manual');
        }
      } else if (palette.has(name)) {
        warn(
          node,
          `'${name}' is an old palette color with no role of its own. Pick the role from design's component map (@skillsoft/gamut-brand src/migration.ts, COMPONENTS).`
        );
        note('color-roles:palette');
      }
    };

    const visitString = (lit: Node, markAt: number) =>
      visit(
        lit,
        lit.value,
        (role) => ({ start: lit.start + 1, end: lit.end - 1, text: role }),
        markAt
      );

    /* Every string a color-valued expression can produce. */
    const collect = (expr: Node | null | undefined, markAt?: number) => {
      if (!expr) return;
      switch (expr.type) {
        case 'StringLiteral':
        case 'Literal':
          if (isString(expr)) visitString(expr, markAt ?? expr.start);
          return;
        case 'ConditionalExpression':
          collect(expr.consequent);
          collect(expr.alternate);
          return;
        case 'LogicalExpression':
          collect(expr.left);
          collect(expr.right);
          return;
        case 'ObjectExpression':
          for (const p of expr.properties) {
            if (p.type === 'ObjectProperty' || p.type === 'Property') {
              collect(p.value);
            }
          }
          return;
        case 'ArrayExpression':
          expr.elements.forEach((el: Node) => collect(el));
          return;
        case 'TSAsExpression':
        case 'TSSatisfiesExpression':
        case 'TSNonNullExpression':
        case 'ParenthesizedExpression':
        case 'TypeCastExpression':
          collect(expr.expression, markAt);
          return;
        case 'TemplateLiteral':
          if (expr.expressions.length > 0) {
            warn(
              expr,
              `color name built at runtime (${source.slice(
                expr.start,
                expr.end
              )}). The codemod can't map it; check each value it can take.`
            );
            note('color-roles:runtime');
          }
          return;
        default:
      }
    };

    root.find(j.JSXAttribute).forEach((p) => {
      const attr = p.node as unknown as Node;
      if (attr.name?.type !== 'JSXIdentifier' || !props.has(attr.name.name)) {
        return;
      }
      const { value } = attr;
      if (isString(value)) collect(value, attr.start);
      else if (value?.type === 'JSXExpressionContainer') {
        collect(value.expression);
      }
    });

    root.find(j.Node).forEach((p) => {
      const node = p.node as unknown as Node;
      if (node.type === 'ObjectProperty' || node.type === 'Property') {
        const key = keyName(node);
        if (key && props.has(key)) {
          collect(node.value, isString(node.value) ? node.start : undefined);
        }
        return;
      }

      if (
        (node.type === 'MemberExpression' ||
          node.type === 'OptionalMemberExpression') &&
        isThemeColors(node.object)
      ) {
        const { property } = node;
        const name = node.computed
          ? isString(property)
            ? property.value
            : undefined
          : property?.name;
        if (!name) return;
        visit(
          node,
          name,
          (role) =>
            node.computed
              ? { start: property.start + 1, end: property.end - 1, text: role }
              : {
                  /* `.text` → `['text-default']`, keeping a `?.` */
                  start: node.object.end,
                  end: property.end,
                  text: `${
                    source.slice(node.object.end, property.start).includes('?.')
                      ? '?.'
                      : ''
                  }['${role}']`,
                },
          node.start
        );
        return;
      }

      if (
        node.type === 'CallExpression' &&
        node.callee?.type === 'Identifier' &&
        node.callee.name === 'themed' &&
        isString(node.arguments?.[0]) &&
        node.arguments[0].value.startsWith('colors.')
      ) {
        const arg = node.arguments[0];
        const name = arg.value.slice('colors.'.length);
        visit(
          arg,
          name,
          (role) => ({
            start: arg.start + 1,
            end: arg.end - 1,
            text: `colors.${role}`,
          }),
          node.start
        );
      }
    });

    /*
      `var(--color-…)` in a string or template literal. A rename is applied
      in place; a name for a person gets its comment in front of the
      literal, outside the string.
    */
    root.find(j.Node).forEach((p) => {
      const node = p.node as unknown as Node;
      const literal = isString(node) || node.type === 'TemplateLiteral';
      if (!literal) return;
      const raw = source.slice(node.start, node.end);
      if (!mentionsOldVar(raw)) return;
      for (const hit of findOldVars(raw, manifest)) {
        const at = node.start + hit.at;
        if (hit.role) {
          edits.push({
            start: at,
            end: at + `--color-${hit.name}`.length,
            text: `--color-${hit.role}`,
          });
        } else if (hit.alias) {
          if (!marked(node.start) && !seen.has(node.start)) {
            seen.add(node.start);
            edits.push({
              start: node.start,
              end: node.start,
              text: commentText(hit.name, hit.alias),
            });
          }
          warn(node, describe(hit.name, hit.alias));
          note('color-roles:manual');
        } else if (hit.palette) {
          warn(node, paletteMessage(hit.name));
          note('color-roles:palette');
        }
      }
    });

    /* Card's variant, when Card comes from gamut. */
    const cardNames = new Set<string>();
    root.find(j.ImportDeclaration).forEach((p) => {
      const decl = p.node as unknown as Node;
      if (!GAMUT.test(decl.source.value)) return;
      for (const spec of decl.specifiers ?? []) {
        if (spec.type === 'ImportSpecifier' && spec.imported?.name === 'Card') {
          cardNames.add(spec.local?.name ?? 'Card');
        }
      }
    });
    if (cardNames.size > 0) {
      root.find(j.JSXOpeningElement).forEach((p) => {
        const el = p.node as unknown as Node;
        if (el.name?.type !== 'JSXIdentifier' || !cardNames.has(el.name.name)) {
          return;
        }
        for (const attr of el.attributes ?? []) {
          if (attr.type !== 'JSXAttribute' || attr.name?.name !== 'variant') {
            continue;
          }
          const lits: Node[] = [];
          const gather = (e: Node | null | undefined) => {
            if (!e) return;
            if (isString(e)) lits.push(e);
            else if (e.type === 'ConditionalExpression') {
              gather(e.consequent);
              gather(e.alternate);
            } else if (e.type === 'LogicalExpression') gather(e.right);
          };
          if (isString(attr.value)) gather(attr.value);
          else if (attr.value?.type === 'JSXExpressionContainer') {
            gather(attr.value.expression);
          }
          for (const lit of lits) {
            const to = CARD_VARIANTS[lit.value];
            if (!to) continue;
            edits.push({ start: lit.start + 1, end: lit.end - 1, text: to });
            if (lit.value === 'navy') {
              if (!marked(attr.start)) {
                edits.push({
                  start: attr.start,
                  end: attr.start,
                  text: NAVY_CARD,
                });
              }
              warn(
                lit,
                "Card's 'navy' variant becomes 'default', which renders light. Wrap the card in <ColorMode mode=\"dark\"> if it should stay dark."
              );
              note('color-roles:card-navy');
            }
          }
        }
      });
    }

    return edits;
  },
};
