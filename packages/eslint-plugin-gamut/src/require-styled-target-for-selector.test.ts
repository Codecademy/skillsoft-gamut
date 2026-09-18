import { TSESLint } from '@typescript-eslint/utils';

import rule from './require-styled-target-for-selector';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('require-styled-target-for-selector', rule, {
  valid: [
    // no interpolation at all
    `const styles = { color: 'red' };`,
    // styled() call with an explicit target
    `
      const CategoryLabel = styled(Text, { target: 'gmt-category-label' })(css({}));
      const styles = {
        [\`&:hover \${CategoryLabel}\`]: { textDecoration: 'underline' },
      };
    `,
    // interpolated identifier isn't a styled() call at all
    `
      const Foo = 'some-string';
      const styles = {
        [\`&:hover \${Foo}\`]: { textDecoration: 'underline' },
      };
    `,
    // template literal that isn't a computed object key — not the pattern
    // this rule cares about
    `
      const CategoryLabel = styled(Text)(css({}));
      const selector = \`&:hover \${CategoryLabel}\`;
    `,
  ],
  invalid: [
    {
      code: `
        const CategoryLabel = styled(Text)(css({}));
        const styles = {
          [\`&:hover \${CategoryLabel}\`]: { textDecoration: 'underline' },
        };
      `,
      errors: [{ messageId: 'missingTarget' }],
    },
    {
      code: `
        const CategoryLabel = styled(Text, { shouldForwardProp: () => true })(css({}));
        const styles = {
          [\`&:hover \${CategoryLabel}\`]: { textDecoration: 'underline' },
        };
      `,
      errors: [{ messageId: 'missingTarget' }],
    },
  ],
});
