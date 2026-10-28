import fs from 'node:fs';
import path from 'node:path';

import { walk } from './leftovers';

const FLAT_CONFIG = /(^|\/)eslint\.config\.[cm]?[jt]s$/;

const flatConfigIn = (dir: string) =>
  fs
    .readdirSync(dir)
    .map((name) => path.join(dir, name))
    .find((file) => FLAT_CONFIG.test(file));

/*
  The first flat ESLint config that applies to any root, or null: one
  inside it, or one in a parent directory up to the git root (running on
  a subfolder of a repo still uses the repo's config). In a flat config the rule prefix is
  the key the plugin is registered under (`plugins: { gamut }`), not the
  package name, so renaming the package doesn't change it.
*/
export const findFlatEslintConfig = (roots: string[]) => {
  for (const root of roots) {
    const isDir = fs.statSync(root).isDirectory();
    for (
      let dir = isDir ? root : path.dirname(root);
      dir !== path.dirname(dir);
      dir = path.dirname(dir)
    ) {
      const found = flatConfigIn(dir);
      if (found) return found;
      if (fs.existsSync(path.join(dir, '.git'))) break;
    }
    if (!isDir) continue;
    for (const file of walk(root)) {
      if (FLAT_CONFIG.test(file)) return file;
    }
  }
  return null;
};
