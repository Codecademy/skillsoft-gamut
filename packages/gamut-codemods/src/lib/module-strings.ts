import type { Collection, JSCodeshift, StringLiteral } from 'jscodeshift';

/*
  Finds every string in a file that names a module: import and export
  sources, require(), dynamic import(), jest/vi mocks, `import('x').T` types,
  and `declare module 'x'` augmentations. Migrations that rewrite a specifier
  should go through here, so a new place a module name can appear only has
  to be taught once.
*/

const CALLEE_OBJECTS = new Set(['jest', 'vi']);
const CALLEE_METHODS = new Set([
  'mock',
  'doMock',
  'unmock',
  'dontMock',
  'requireActual',
  'requireMock',
  'importActual',
  'importMock',
  'setMock',
]);

/*
  The tsx parser produces StringLiteral; the babel/estree ones produce
  Literal. Both carry babel's start/end offsets, which splice edits rely on.
*/
export type StringNode = StringLiteral & { start: number; end: number };

export const isStringLiteral = (node: unknown): node is StringNode => {
  const n = node as { type?: string; value?: unknown } | null;
  return (
    !!n &&
    (n.type === 'StringLiteral' ||
      (n.type === 'Literal' && typeof n.value === 'string'))
  );
};

/*
  Identifier-ish nodes (Identifier, JSXIdentifier, TSTypeParameter) all
  carry a string `name`, but the jscodeshift types don't share one shape.
*/
export const nameOf = (node: unknown) => {
  const name = (node as { name?: unknown } | null | undefined)?.name;
  return typeof name === 'string' ? name : '';
};

const isModuleCall = (callee: any): boolean => {
  if (callee.type === 'Import') return true;
  if (callee.type === 'Identifier') return callee.name === 'require';
  if (callee.type === 'MemberExpression' && !callee.computed) {
    const { object, property } = callee;
    if (object.type !== 'Identifier') return false;
    if (object.name === 'require') return property.name === 'resolve';
    return CALLEE_OBJECTS.has(object.name) && CALLEE_METHODS.has(property.name);
  }
  return false;
};

/* The string literal nodes that name a module, in source order. */
export const findModuleStrings = (j: JSCodeshift, root: Collection) => {
  const found: StringNode[] = [];
  const push = (node: unknown) => {
    if (isStringLiteral(node)) found.push(node);
  };

  root.find(j.ImportDeclaration).forEach((p) => push(p.node.source));
  root.find(j.ExportNamedDeclaration).forEach((p) => push(p.node.source));
  root.find(j.ExportAllDeclaration).forEach((p) => push(p.node.source));
  root.find(j.CallExpression).forEach((p) => {
    if (isModuleCall(p.node.callee)) push(p.node.arguments[0]);
  });
  root.find(j.ImportExpression).forEach((p) => push(p.node.source));
  root.find(j.TSImportType).forEach((p) => push(p.node.argument));
  root.find(j.TSModuleDeclaration).forEach((p) => push(p.node.id));
  root
    .find(j.TSExternalModuleReference)
    .forEach((p) => push(p.node.expression));

  return found;
};
