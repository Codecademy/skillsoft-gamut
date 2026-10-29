import fs from 'node:fs';
import path from 'node:path';

import { walk } from './leftovers';

const FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

const rangesIn = (file: string, pkg: string) => {
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<
      string,
      Record<string, string> | undefined
    >;
    return FIELDS.flatMap((field) => json[field]?.[pkg] ?? []);
  } catch {
    return [];
  }
};

/*
  Every range `pkg` is listed at in the package.json files under the roots,
  plus the nearest one above each root up to the git root (running on a
  subfolder of a monorepo still depends on the root package.json).
*/
export const findPackageRanges = (roots: string[], pkg: string) => {
  const files = new Set<string>();
  for (const root of roots) {
    const isDir = fs.statSync(root).isDirectory();
    for (
      let dir = isDir ? root : path.dirname(root);
      dir !== path.dirname(dir);
      dir = path.dirname(dir)
    ) {
      const file = path.join(dir, 'package.json');
      if (fs.existsSync(file)) {
        files.add(file);
        break;
      }
      if (fs.existsSync(path.join(dir, '.git'))) break;
    }
    if (!isDir) continue;
    for (const file of walk(root)) {
      if (path.basename(file) === 'package.json') files.add(file);
    }
  }
  return [...files].flatMap((file) => rangesIn(file, pkg));
};
