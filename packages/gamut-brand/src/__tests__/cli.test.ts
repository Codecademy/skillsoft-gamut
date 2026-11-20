import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

/*
  The CLI end to end, from source, the way a team building its own brand
  runs it. A subprocess because Style Dictionary is ESM-only and Jest can't
  load it.
*/
/* jiti's `bin`; its exports don't include the file itself. */
const JITI = join(
  dirname(require.resolve('jiti/package.json')),
  'lib/jiti-cli.mjs'
);
const CLI = join(__dirname, '../cli.ts');
const INDEX = join(__dirname, '../index.ts');

const run = (...args: string[]) => {
  const result = spawnSync(process.execPath, [JITI, CLI, ...args], {
    encoding: 'utf8',
  });
  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`,
  };
};

describe('gamut-brand build', () => {
  let dir: string;
  const brandFile = () => join(dir, 'acme.brand.ts');
  const writeBrand = (body: string) =>
    writeFileSync(
      brandFile(),
      `import { defineBrand } from ${JSON.stringify(
        INDEX
      )};\nexport default defineBrand(${body});\n`
    );

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'gamut-brand-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('writes one brand, checks it, and notices when its input changes', () => {
    writeBrand(`{ name: 'acme', hues: { primary: '#0A5CFF' } }`);

    const built = run('build', brandFile());
    expect(built.output).toContain('wrote "acme"');
    expect(built.status).toBe(0);

    const out = join(dir, 'acme');
    const css = readFileSync(join(out, 'tokens.css'), 'utf8');
    /* This brand only, starting on :root in light mode. */
    expect(css).toContain(':root, [data-brand="acme"] {');
    expect(css).toContain(':root, [data-color-mode="light"] {');
    expect(css).toContain('[data-color-mode="dark"] {');
    expect(css).not.toMatch(/data-brand="(?!acme")/);

    const values = readFileSync(join(out, 'values.ts'), 'utf8');
    expect(values).toContain('"initialMode": "light"');
    expect(values).toContain(
      `export const tokensCss = ${JSON.stringify(css)};`
    );
    for (const file of ['palette', 'light', 'dark']) {
      expect(() =>
        JSON.parse(readFileSync(join(out, `${file}.tokens.json`), 'utf8'))
      ).not.toThrow();
    }

    expect(run('build', brandFile(), '--check').status).toBe(0);
    expect(run('build', brandFile()).output).toContain('"acme" unchanged');

    writeBrand(
      `{ name: 'acme', hues: { primary: '#0A5CFF' }, initialMode: 'dark' }`
    );
    const stale = run('build', brandFile(), '--check');
    expect(stale.status).toBe(1);
    expect(stale.output).toContain('"acme" is out of date');

    expect(run('build', brandFile()).status).toBe(0);
    expect(readFileSync(join(out, 'tokens.css'), 'utf8')).toContain(
      ':root, [data-color-mode="dark"] {'
    );
  }, 60000);

  it('refuses a brand that fails a check, and says which', () => {
    /* Pins primary-800 near white: text on it can't reach 4.5:1. */
    writeBrand(
      `{ name: 'acme', hues: { primary: 262 }, overrides: { palette: { 'primary-800': '#E8EEFF' } } }`
    );
    const result = run('build', brandFile(), '--out', join(dir, 'out'));
    expect(result.status).toBe(1);
    expect(result.output).toContain('refusing to generate "acme"');
  }, 60000);

  it('refuses a name that would break CSS or an import', () => {
    writeBrand(`{ name: 'acme corp', hues: { primary: 262 } }`);
    const result = run('build', brandFile());
    expect(result.status).toBe(1);
    expect(result.output).toContain('brand name "acme corp"');
  }, 60000);
});
