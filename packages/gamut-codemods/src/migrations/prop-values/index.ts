import type {
  ASTPath,
  Collection,
  JSCodeshift,
  JSXAttribute,
  JSXOpeningElement,
} from 'jscodeshift';

import type { ComponentPropChanges, PropChange } from '../../lib/manifest';
import { isStringLiteral, nameOf } from '../../lib/module-strings';
import type { Edit, SpliceMigration, Warn } from '../../lib/types';

/*
  Renames props and rewrites their string values on specific Gamut
  components, from the manifest's componentProps table. The same prop name
  means different things on different components (Modal's `size` is not
  Button's), so a rule only applies to the components it names.

  Components are matched through their imports from the package in the
  table, so aliases work (`import { FillButton as Btn }`) and a local
  component with the same name is left alone.

  Only string literals are rewritten, as `prop="old"` or `prop={'old'}`.
  Any other expression for a prop that has values to convert is left alone
  with a warning, since its value can't be known statically.

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

const attributeEdits = (
  attr: JSXAttribute,
  change: PropChange,
  component: string,
  source: string,
  warn: Warn,
  element: JSXOpeningElement
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

  if (!change.values || !attr.value) return edits;

  let literal: { value: string; start: number; end: number } | undefined;
  if (isStringLiteral(attr.value)) {
    literal = attr.value;
  } else if (attr.value.type === 'JSXExpressionContainer') {
    if (isStringLiteral(attr.value.expression)) {
      literal = attr.value.expression;
    } else {
      warn(
        element,
        `${component} ${name.name} is not a string literal, so it was not converted. Check its value by hand.`
      );
      return edits;
    }
  }
  if (!literal || !hasOwn(change.values, literal.value)) return edits;

  /* Keep the source's quote style: `"small"` stays double-quoted. */
  const quote = source[literal.start];
  edits.push({
    start: literal.start,
    end: literal.end,
    text: `${quote}${change.values[literal.value]}${quote}`,
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
          if (!hasOwn(props, attr.name.name)) continue;
          edits.push(
            ...attributeEdits(
              attr,
              props[attr.name.name],
              component,
              source,
              warn,
              element
            )
          );
        }
      });
    return edits;
  },
};
