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

const GAMUT_VIDEO_PATH =
  /['"`](?:@codecademy|@skillsoft)\/gamut\/Video[\w/-]*['"`]/;
const IMPORT =
  /import\s[^;]*?from\s*['"`]((?:@codecademy|@skillsoft)\/gamut[\w./-]*)['"`]/g;
const VIDEO_NAME = /\b(?:Video|VideoProps|MarkdownVideo)\b/;

/* True when the file imports a Video name from gamut, or reaches the Video subpath. */
const usesVideoIn = (source: string) => {
  if (GAMUT_VIDEO_PATH.test(source)) return true;
  for (const match of source.matchAll(IMPORT)) {
    const clause = match[0].slice(0, match[0].lastIndexOf('from'));
    if (VIDEO_NAME.test(clause)) return true;
  }
  return false;
};

const containsGamut = (dir: string, test: (source: string) => boolean) => {
  for (const file of walk(dir)) {
    if (!SOURCE.test(file)) continue;
    if (test(fs.readFileSync(file, 'utf8'))) return true;
  }
  return false;
};

const memoizedPer = (test: (source: string) => boolean) => {
  const seen = new Map<string, boolean>();
  return (file: string) => {
    const dir = path.dirname(file);
    let known = seen.get(dir);
    if (known === undefined) {
      known = containsGamut(dir, test);
      seen.set(dir, known);
    }
    return known;
  };
};

export const videoUsage = () => memoizedPer(usesVideoIn);

/*
  One check per run: each directory is walked once, however many files in
  it ask. The CLI makes one of these and hands each file a closure over it.
*/
export const gamutUsage = () =>
  memoizedPer((source) => GAMUT_SPECIFIER.test(source));
