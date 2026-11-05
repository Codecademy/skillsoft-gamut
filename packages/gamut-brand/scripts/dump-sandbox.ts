/* eslint-disable no-console -- CLI script; the console is its output. */
/*
 * Refreshes `src/__fixtures__/sandbox.json`, the copy of design's
 * sandbox output that `sandboxParity.test.ts` holds the generator to.
 *
 *   yarn workspace @skillsoft/gamut-brand dump:sandbox <sandbox checkout>
 *
 * The checkout is a clone of skillsoft-common/gamut-sandbox with its
 * dependencies installed (`yarn` there), on whatever commit you're porting.
 * The fixture records the branch and commit it came from, so the test names
 * them. After a dump, run the tests: what fails is what the port still has
 * to take from the sandbox.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [checkout] = process.argv.slice(2);
if (!checkout) {
  console.error('usage: dump:sandbox <path to a gamut-sandbox checkout>');
  process.exit(1);
}
const SANDBOX = resolve(checkout);
const OUT = join(__dirname, '../src/__fixtures__/sandbox.json');

const git = (...args: string[]) =>
  execFileSync('git', ['-C', SANDBOX, ...args], { encoding: 'utf8' }).trim();

/* A detached checkout names the remote branch that holds the commit, if one does. */
const branch = () => {
  const name = git('rev-parse', '--abbrev-ref', 'HEAD');
  if (name !== 'HEAD') return name;
  const remote = git(
    'branch',
    '-r',
    '--contains',
    'HEAD',
    '--format=%(refname:short)'
  )
    .split('\n')
    .find((b) => b && !b.endsWith('/HEAD'));
  return remote ? remote.replace(/^[^/]+\//, '') : '(detached)';
};

const main = async () => {
  const palette = await import(join(SANDBOX, 'src/colorSystem/palette.ts'));
  const roles = await import(join(SANDBOX, 'src/colorSystem/roles.ts'));

  const families = Object.fromEntries(
    palette.FAMILIES.map((name: string) => {
      const f = palette.family(name);
      return [
        name,
        {
          hue: f.hue,
          neutral: f.neutral,
          rungs: Object.fromEntries(
            Object.entries<{ l: number; c: number; hex: string }>(f.rungs).map(
              ([grade, r]) => [grade, { l: r.l, c: r.c, hex: r.hex }]
            )
          ),
        },
      ];
    })
  );

  const fixture = {
    source: {
      repo: 'skillsoft-common/gamut-sandbox',
      branch: branch(),
      commit: git('rev-parse', '--short', 'HEAD'),
      dumped: new Date().toISOString().slice(0, 10),
    },
    families,
    roles: roles.ROLES.map(
      (r: {
        token: string;
        light: { primitive: string; hex: string };
        dark: { primitive: string; hex: string };
      }) => ({
        token: r.token,
        light: { primitive: r.light.primitive, hex: r.light.hex },
        dark: { primitive: r.dark.primitive, hex: r.dark.hex },
      })
    ),
  };

  writeFileSync(OUT, `${JSON.stringify(fixture, null, 2)}\n`);
  console.log(
    `${fixture.roles.length} roles from ${fixture.source.branch} at ${fixture.source.commit} → ${OUT}`
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
