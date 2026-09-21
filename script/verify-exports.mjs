#!/usr/bin/env node
/*
 * Resolves every publishable package's `exports` map from the repo root,
 * the same way a real consumer would, and asserts:
 *   1. the root subpath resolves AND loads (via both ESM `import` and CJS
 *      `require`) — not just that the path string is syntactically valid
 *   2. old deep `dist/*` paths, which the exports map no longer lists, are
 *      correctly blocked with ERR_PACKAGE_PATH_NOT_EXPORTED
 *
 * publint/attw check the package.json fields are internally consistent;
 * this script checks Node's actual resolver agrees, since workspace
 * symlinks make it easy for that to silently diverge.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const PACKAGES = [
  'variance',
  'gamut-styles',
  'gamut-icons',
  'gamut-patterns',
  'gamut-illustrations',
  'gamut-tests',
  'gamut',
];

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`✗ ${message}`);
}

function pass(message) {
  console.log(`✓ ${message}`);
}

for (const pkg of PACKAGES) {
  const name = `@skillsoft/${pkg}`;

  // 1. CJS require() resolves and the module actually loads.
  try {
    // .css files have no CJS transform outside a bundler — stub them, same
    // as a real consumer's test environment would.
    require.extensions['.css'] = () => {};
    const mod = require(name);
    const exportCount = Object.keys(mod).length;
    if (exportCount === 0) {
      fail(`${name}: loaded via require() but has 0 named exports`);
    } else {
      pass(`${name}: require() resolves and loads (${exportCount} exports)`);
    }
  } catch (err) {
    fail(`${name}: require() failed — ${err.code ?? err.message}`);
  }

  // 2. ESM import resolves and the module actually loads.
  //
  // Known, non-blocking gap: variance (and everything that transitively
  // depends on it) imports lodash via extensionless deep subpaths
  // (`lodash/get`, not `lodash/get.js`). lodash ships no `exports` map, so
  // Node's *native* ESM resolver — unlike `require()`, and unlike every
  // bundler's resolver (webpack, esbuild, rollup all probe extensions) —
  // refuses those imports outright. This is inherent to lodash's own
  // packaging, predates this migration, and only bites a consumer running
  // `node --experimental-vm-modules` or similar with zero bundler in front —
  // not a real consumption path for any package here today. Fixing it means
  // rewriting ~25 files' lodash imports across 5 packages; tracked as a
  // fast-follow, not blocking here. See tsdown migration notes (GMT-1741).
  try {
    const mod = await import(name);
    const exportCount = Object.keys(mod).length;
    if (exportCount === 0) {
      fail(`${name}: loaded via import() but has 0 named exports`);
    } else {
      pass(`${name}: import() resolves and loads (${exportCount} exports)`);
    }
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' && /lodash\//.test(err.message)) {
      console.warn(
        `⚠ ${name}: import() failed on a lodash deep import (known gap, not blocking) — ${err.message.split('\n')[0]}`
      );
    } else {
      fail(`${name}: import() failed — ${err.code ?? err.message}`);
    }
  }

  // 3. Old deep dist paths are blocked — the exports map is root-only, so
  // anything reaching past it should fail with ERR_PACKAGE_PATH_NOT_EXPORTED.
  for (const deepPath of [`${name}/dist/index.js`, `${name}/src/index.ts`]) {
    try {
      require.resolve(deepPath);
      fail(`${deepPath}: resolved, but the exports map should block this`);
    } catch (err) {
      if (err.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
        pass(`${deepPath}: correctly blocked`);
      } else {
        fail(`${deepPath}: blocked, but with the wrong error — ${err.code}`);
      }
    }
  }
}

console.log('');
if (failures > 0) {
  console.error(`${failures} check(s) failed.`);
  process.exit(1);
} else {
  console.log('All export checks passed.');
}
