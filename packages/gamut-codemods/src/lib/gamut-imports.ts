import fs from 'node:fs';
import path from 'node:path';

import { walk } from './leftovers';

/*
  Whether the source under a directory imports gamut, under either scope or
  any of its subpaths. A worker in a repo that also has a gamut app never
  imports it, and warnings about gamut's behaviour don't apply there.
*/
const SOURCE = /\.(m?[jt]sx?|c[jt]s|mdx?)$/;
const GAMUT_SPECIFIER = /['"`](?:@codecademy|@skillsoft)\/gamut[\w./-]*['"`]/;

const containsGamut = (dir: string) => {
  for (const file of walk(dir)) {
    if (!SOURCE.test(file)) continue;
    if (GAMUT_SPECIFIER.test(fs.readFileSync(file, 'utf8'))) return true;
  }
  return false;
};

/*
  One check per run: each directory is walked once, however many files in
  it ask. The CLI makes one of these and hands each file a closure over it.
*/
export const gamutUsage = () => {
  const seen = new Map<string, boolean>();
  return (file: string) => {
    const dir = path.dirname(file);
    let known = seen.get(dir);
    if (known === undefined) {
      known = containsGamut(dir);
      seen.set(dir, known);
    }
    return known;
  };
};
