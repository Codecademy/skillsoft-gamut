import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

import { createRule } from './createRule';

/*
 * `@emotion/babel-plugin` stamps a `target` property on every `styled()`
 * call automatically — that's what makes a component-selector interpolation
 * like `` [`&:hover ${OtherComponent}`] `` work at runtime. Gamut's
 * production build (tsdown) doesn't run that plugin, so any `styled()` call
 * consumed this way needs an explicit `target` in its own source, or the
 * selector silently degrades to `.undefined` in production while looking
 * correct in dev/test/Storybook (which still run the component through
 * Babel). See packages/gamut/src/BarChart/BarRow/elements.tsx for the one
 * existing example.
 */

// `styled(X, options)(...)` is a curried call: the outer CallExpression's
// callee is itself the `styled(X, options)` call, not the identifier
// `styled`. Find that inner call, since `options` (and `target`) live there.
const findStyledCall = (
  node: TSESTree.Node
): TSESTree.CallExpression | undefined => {
  if (node.type !== AST_NODE_TYPES.CallExpression) return undefined;
  if (
    node.callee.type === AST_NODE_TYPES.Identifier &&
    node.callee.name === 'styled'
  ) {
    return node;
  }
  return findStyledCall(node.callee);
};

const hasExplicitTarget = (call: TSESTree.CallExpression): boolean => {
  const optionsArg = call.arguments[1];
  return (
    optionsArg?.type === AST_NODE_TYPES.ObjectExpression &&
    optionsArg.properties.some(
      (prop) =>
        prop.type === AST_NODE_TYPES.Property &&
        prop.key.type === AST_NODE_TYPES.Identifier &&
        prop.key.name === 'target'
    )
  );
};

export default createRule({
  create(context) {
    return {
      TemplateLiteral(node: TSESTree.TemplateLiteral) {
        // Only care about template literals used as a computed style-object
        // key, e.g. `[`&:hover ${Foo}`]: { ... }` — not every template
        // literal in the file.
        const { parent } = node;
        if (
          parent?.type !== AST_NODE_TYPES.Property ||
          parent.key !== node ||
          !parent.computed
        ) {
          return;
        }

        for (const expression of node.expressions) {
          if (expression.type !== AST_NODE_TYPES.Identifier) continue;

          const variable = context.sourceCode
            .getScope(expression)
            .references.find((ref) => ref.identifier === expression)
            ?.resolved;
          const declarator = variable?.defs.find(
            (def) => def.node.type === AST_NODE_TYPES.VariableDeclarator
          )?.node as TSESTree.VariableDeclarator | undefined;
          const init = declarator?.init;

          const styledCall = init && findStyledCall(init);
          if (!styledCall) continue;

          if (!hasExplicitTarget(styledCall)) {
            context.report({
              messageId: 'missingTarget',
              node: expression,
              data: { name: expression.name },
            });
          }
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'Require an explicit `target` on a styled() component used as a selector interpolation.',
    },
    messages: {
      missingTarget:
        '`{{name}}` is interpolated into a style selector but its styled() call has no explicit `target`. ' +
        '@emotion/babel-plugin normally stamps this automatically, but the production build does not run ' +
        'that plugin — add `styled(X, { target: \'some-stable-name\' })` or the selector silently breaks in production.',
    },
    type: 'problem',
    schema: [],
  },
  name: 'require-styled-target-for-selector',
});
