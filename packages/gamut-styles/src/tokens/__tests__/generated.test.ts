import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';

import { brands, tokensCss } from '..';

/*
  The generated folders are what @skillsoft/gamut-brand writes for gamut's
  own brands today, tokens.css round-trip and every check included. A
  subprocess because Style Dictionary is ESM-only and Jest can't load it.
*/
describe('generated tokens', () => {
  it('are current — run `yarn workspace @skillsoft/gamut-styles build:tokens`', () => {
    const result = spawnSync(
      process.execPath,
      [
        join(dirname(require.resolve('jiti/package.json')), 'lib/jiti-cli.mjs'),
        join(__dirname, '../../../scripts/build-tokens.ts'),
        '--check',
      ],
      { encoding: 'utf8' }
    );
    expect(`${result.stdout}${result.stderr}`).toContain(
      'generated tokens are current'
    );
    expect(result.status).toBe(0);
  }, 120000);

  /* Each brand carries its own colors, and no other brand's. */
  it.each(Object.entries(brands))('%s ships only itself', (name, values) => {
    const named = [...values.tokensCss.matchAll(/data-brand="(\w+)"/g)].map(
      (m) => m[1]
    );
    expect(new Set(named)).toEqual(new Set([name]));
    expect(values.brand.name).toBe(name);
  });

  it('exports the default brand at the top level', () => {
    expect(tokensCss).toBe(brands.skillsoft.tokensCss);
  });
});
