import jscodeshift from 'jscodeshift';

import { findModuleStrings } from '../lib/module-strings';

/*
  Calls that aren't require(), import(), or a known module API must not be
  taken for module strings, even when their argument looks like a package.
*/
describe('findModuleStrings', () => {
  it('finds module strings in require and require.resolve, and skips other calls', () => {
    const j = jscodeshift.withParser('tsx');
    const root = j(`
      require('@codecademy/gamut/a');
      require.resolve('@codecademy/gamut/b');
      getModule()('@codecademy/gamut/c');
      (0, load)('@codecademy/gamut/d');
    `);
    const values = findModuleStrings(j, root).map((node) => node.value);
    expect(values).toEqual(['@codecademy/gamut/a', '@codecademy/gamut/b']);
  });
});
