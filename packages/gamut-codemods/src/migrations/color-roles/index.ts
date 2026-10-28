import type { Edit, SpliceMigration } from '../../lib/types';
import type {
  ColorAlias,
  ColorRolesManifest,
} from '../../presets/color-roles/manifest';
import { isAutomatic } from '../../presets/color-roles/manifest';

/*
  Today's Gamut color names → roles, wherever a color name sits:

  - a color prop in JSX (`bg="background-primary"`) or in a style object
    (`css`, `variant`, `states`, plain objects), including the branches of a
    ternary or `&&`, and responsive objects and arrays;
  - `theme.colors.text` / `theme.colors['text-disabled']`;
  - `themed('colors.primary')`.

  Rename and merge rows are applied. Split, retire and pending rows need a
  person: the name stays (so it still fails the type check) and a
  `/* color-roles: … *\/` comment with design's rule goes in front of it.
  Old palette names (navy, hyper-500) and names built at runtime
  (`${variant}-hover`) only warn. Anything outside those positions, like a
  name in a const that's passed to `bg` later, isn't seen.
*/

const MARK = 'color-roles:';

/* Babel AST nodes, loosely: positions plus whatever the type carries. */
interface Node {
  type: string;
  start: number;
  end: number;
  loc?: { start: { line: number } } | null;
  [key: string]: any;
}

const isString = (n: Node | null | undefined): n is Node =>
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

/* "'background' splits into surface-raised | surface-default. <rule>" */
const describe = (name: string, { kind, to, rule }: ColorAlias) => {
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
const commentText = (name: string, alias: ColorAlias) =>
  `/* ${MARK} ${describe(name, alias).replace(/\*\//g, '* /')} */ `;

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

    /* Already marked by an earlier run: a color-roles comment right before `at`. */
    const marked = (at: number) => {
      const before = source.slice(0, at).trimEnd();
      if (!before.endsWith('*/')) return false;
      const open = before.lastIndexOf('/*');
      return open !== -1 && before.slice(open).includes(MARK);
    };

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
          `'${name}' is an old palette color with no role of its own. Pick the role from design's component map (gamut-styles colorSystem/migration.ts, COMPONENTS).`
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

    return edits;
  },
};
