import type {
  ASTPath,
  Collection,
  JSCodeshift,
  JSXAttribute,
  JSXOpeningElement,
} from 'jscodeshift';

import type { ComponentPropChanges, PropChange } from '../../lib/manifest';
import {
  isStringLiteral,
  nameOf,
  type StringNode,
} from '../../lib/module-strings';
import type { Edit, SpliceMigration, Warn } from '../../lib/types';

/*
  Renames props and rewrites their string values on specific Gamut
  components, from the manifest's componentProps table. The same prop name
  means different things on different components (Modal's `size` is not
  Button's), so a rule only applies to the components it names.

  Components are matched through their imports from the package in the
  table, so aliases work (`import { FillButton as Btn }`) and a local
  component with the same name is left alone.

  Only string literals are rewritten: as `prop="old"` or `prop={'old'}`, in
  either branch of a ternary (`prop={cond ? 'old' : 'other'}`), and in the
  type of a prop that a Gamut attribute passes through (`size?: 'small' |
  'normal'`, with `size = 'normal'` as its default). The type rewrite only
  applies when the file passes a prop of that name to a Gamut component.
  Any other expression for a prop that has values to convert is left alone
  with a warning, which names where the expression's values are declared.

  Idempotent: the new values aren't keys in any table, and a renamed prop
  is no longer matched under its old name.
*/

const hasOwn = (object: object, key: string) =>
  Object.prototype.hasOwnProperty.call(object, key);

/* Local binding name -> the component it imports, for the table's components. */
const componentLocals = (
  j: JSCodeshift,
  root: Collection,
  config: ComponentPropChanges
) => {
  const locals = new Map<string, string>();
  root
    .find(j.ImportDeclaration, { source: { value: config.package } })
    .forEach((path) => {
      for (const spec of path.node.specifiers ?? []) {
        if (spec.type !== 'ImportSpecifier') continue;
        const imported = nameOf(spec.imported);
        if (!hasOwn(config.components, imported)) continue;
        locals.set(nameOf(spec.local ?? spec.imported), imported);
      }
    });
  return locals;
};

/* Only the parts of an expression that can carry the prop's value. */
interface ValueExpression {
  type: string;
  name?: string;
  left?: ValueExpression;
  right?: ValueExpression;
  consequent?: ValueExpression;
  alternate?: ValueExpression;
}

/* `a`, `a || b`, and `c ? a : b` give `a` and `b`. Anything else gives none. */
const valueNames = (expression: ValueExpression): string[] => {
  if (expression.type === 'Identifier' && expression.name) {
    return [expression.name];
  }
  const parts =
    expression.type === 'LogicalExpression'
      ? [expression.left, expression.right]
      : expression.type === 'ConditionalExpression'
      ? [expression.consequent, expression.alternate]
      : [];
  return parts.flatMap((part) => (part ? valueNames(part) : []));
};

const attributeExpression = (attr: JSXAttribute) =>
  attr.value?.type === 'JSXExpressionContainer'
    ? (attr.value.expression as unknown as ValueExpression)
    : undefined;

/* Where a value's identifier was declared, so the warning says where to look. */
const declarationNote = (path: ASTPath, name: string) => {
  const binding = path.scope?.lookup(name)?.getBindings()[name]?.[0];
  if (!binding) return `${name} is not declared in this file`;
  if (binding.parent?.node.type.startsWith('Import')) {
    return `${name} is imported`;
  }
  const loc = (binding.node as { loc?: { start: { line: number } } | null })
    .loc;
  return loc
    ? `${name} is declared at line ${loc.start.line}`
    : `${name} is declared in this file`;
};

interface Context {
  source: string;
  warn: Warn;
  path: ASTPath<JSXOpeningElement>;
}

/* The new text for a literal, keeping the source's quote style. */
const literalEdit = (
  literal: StringNode,
  values: Record<string, string>,
  source: string
): Edit | undefined => {
  if (!hasOwn(values, literal.value)) return undefined;
  const quote = source[literal.start];
  return {
    start: literal.start,
    end: literal.end,
    text: `${quote}${values[literal.value]}${quote}`,
  };
};

const attributeEdits = (
  attr: JSXAttribute,
  change: PropChange,
  component: string,
  { source, warn, path }: Context
): Edit[] => {
  const edits: Edit[] = [];
  const name = attr.name as unknown as {
    name: string;
    start: number;
    end: number;
  };
  if (change.rename) {
    edits.push({ start: name.start, end: name.end, text: change.rename });
  }

  const values = change.values;
  if (!values || !attr.value) return edits;

  if (isStringLiteral(attr.value)) {
    const edit = literalEdit(attr.value, values, source);
    return edit ? [...edits, edit] : edits;
  }
  if (attr.value.type !== 'JSXExpressionContainer') return edits;

  const expression = attributeExpression(attr);
  if (!expression) return edits;
  const isTernary = expression.type === 'ConditionalExpression';
  const branches: unknown[] = isTernary
    ? [expression.consequent, expression.alternate]
    : [expression];

  for (const branch of branches) {
    if (isStringLiteral(branch)) {
      const edit = literalEdit(branch, values, source);
      if (edit) edits.push(edit);
    }
  }

  if (branches.every(isStringLiteral)) return edits;

  const notes = valueNames(expression).map((n) => declarationNote(path, n));
  const sourceNote = notes.length > 0 ? ` Source: ${notes.join('; ')}.` : '';
  const what = isTernary
    ? `${component} ${name.name} has a branch that is not a string literal, so that branch was not converted.`
    : `${component} ${name.name} is not a string literal, so it was not converted.`;
  warn(path.node, `${what} Check its value by hand.${sourceNote}`);
  return edits;
};

/*
  Type and default rewrites for props that a Gamut attribute passes through.
  `linked` maps each such prop name to the values of the Gamut prop it feeds.
*/
const linkedEdits = (
  j: JSCodeshift,
  root: Collection,
  linked: Map<string, Record<string, string>>,
  source: string
): Edit[] => {
  const edits: Edit[] = [];

  root.find(j.TSPropertySignature).forEach((path) => {
    const key = path.node.key as { type: string; name?: string };
    const values =
      key.type === 'Identifier' && key.name && linked.get(key.name);
    if (!values) return;
    j(path)
      .find(j.TSLiteralType)
      .forEach((literalType) => {
        const literal = literalType.node.literal as unknown;
        if (!isStringLiteral(literal)) return;
        const edit = literalEdit(literal, values, source);
        if (edit) edits.push(edit);
      });
  });

  root.find(j.AssignmentPattern).forEach((path) => {
    const left = path.node.left as { type: string; name?: string };
    const values =
      left.type === 'Identifier' && left.name && linked.get(left.name);
    if (!values || !isStringLiteral(path.node.right)) return;
    /* Only a destructured prop's default (`{ size = 'normal' }`). */
    const owner = path.parent?.node as
      | { type: string; key?: { name?: string }; value?: unknown }
      | undefined;
    const isProp =
      owner?.type === 'Property' || owner?.type === 'ObjectProperty';
    if (!isProp || owner.value !== path.node || owner.key?.name !== left.name) {
      return;
    }
    const edit = literalEdit(path.node.right, values, source);
    if (edit) edits.push(edit);
  });

  return edits;
};

export const propValues: SpliceMigration = {
  name: 'prop-values',
  kind: 'splice',
  description:
    'Rename props and convert their string values on Gamut components, as set in the preset manifest: size values, Select sizeVariant, and left/right alignment values.',
  edits({ j, root, source, manifest, warn }) {
    const config = manifest.componentProps;
    if (!config) return [];

    const locals = componentLocals(j, root, config);
    if (locals.size === 0) return [];

    const edits: Edit[] = [];
    const linked = new Map<string, Record<string, string>>();
    root
      .find(j.JSXOpeningElement)
      .forEach((path: ASTPath<JSXOpeningElement>) => {
        const element = path.node;
        if (element.name.type !== 'JSXIdentifier') return;
        const component = locals.get(element.name.name);
        if (!component) return;

        const props = config.components[component];
        for (const attr of element.attributes ?? []) {
          if (
            attr.type !== 'JSXAttribute' ||
            attr.name.type !== 'JSXIdentifier'
          ) {
            continue;
          }
          const prop = attr.name.name;
          if (!hasOwn(props, prop)) continue;
          const change = props[prop];
          edits.push(
            ...attributeEdits(attr, change, component, {
              source,
              warn,
              path,
            })
          );

          const expression = attributeExpression(attr);
          if (
            change.values &&
            expression &&
            valueNames(expression).includes(prop) &&
            !linked.has(prop)
          ) {
            linked.set(prop, change.values);
          }
        }
      });

    edits.push(...linkedEdits(j, root, linked, source));
    return edits;
  },
};
