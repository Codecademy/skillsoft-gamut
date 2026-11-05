#!/usr/bin/env node
/* eslint-disable no-console -- CLI; the console is its output. */
import { watch } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { createJiti } from 'jiti';

import type { BrandInput } from './brand';
import { BrandCheckError, staleFiles, writeBrand } from './generate';

const USAGE = `Usage: gamut-brand build <brand file> [--out <dir>] [--watch | --check]

  <brand file>   A .ts, .js or .json file whose default export is the brand
                 (defineBrand({ name, hues, ... })).
  --out <dir>    Where the files go. Defaults to a folder named after the
                 brand, next to the brand file.
  --watch        Regenerate whenever the brand file, or a file next to it,
                 changes.
  --check        Write nothing; exit 1 if the files in --out are missing or
                 out of date. For CI.

Writes values.ts, tokens.css and DTCG JSON (palette, light, dark). Refuses a
brand that fails a contrast or separation check, and says which.`;

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const { values: flags, positionals } = (() => {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        out: { type: 'string', short: 'o' },
        watch: { type: 'boolean', short: 'w' },
        check: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (e) {
    return fail(`${(e as Error).message}\n\n${USAGE}`);
  }
})();

if (flags.help) {
  console.log(USAGE);
  process.exit(0);
}
const [command, file] = positionals;
if (command !== 'build' || !file) fail(USAGE);
if (flags.watch && flags.check) fail('--watch and --check go separately.');

const brandFile = resolve(file);

/* Fresh every time, so a watched edit is picked up, imports included. */
const loadBrand = async (): Promise<BrandInput> => {
  const jiti = createJiti(import.meta.url, {
    moduleCache: false,
    fsCache: false,
  });
  const brand = await jiti.import<BrandInput>(brandFile, { default: true });
  if (!brand?.name || !brand.hues?.primary) {
    throw new Error(
      `${file}: the default export has to be a brand with a name and hues.primary`
    );
  }
  return brand;
};

const outFor = (brand: BrandInput) =>
  flags.out ? resolve(flags.out) : resolve(dirname(brandFile), brand.name);

const show = (path: string) => relative(process.cwd(), path) || '.';

const report = (e: unknown) => {
  if (e instanceof BrandCheckError) {
    console.error(e.message);
    console.error(
      'Pick other hues, or a palette or role override, and run again.'
    );
  } else {
    console.error(e instanceof Error ? e.message : e);
  }
};

let lastOut: string | undefined;

const build = async (): Promise<boolean> => {
  try {
    const brand = await loadBrand();
    const out = outFor(brand);
    lastOut = out;
    if (flags.check) {
      const stale = await staleFiles(brand, out);
      if (stale.length) {
        console.error(
          `"${brand.name}" is out of date: ${stale
            .map(show)
            .join(', ')}\nRun gamut-brand build ${file}${
            flags.out ? ` --out ${flags.out}` : ''
          }.`
        );
        return false;
      }
      console.log(`"${brand.name}" is up to date in ${show(out)}`);
      return true;
    }
    const written = await writeBrand(brand, out);
    console.log(
      written.length
        ? `wrote "${brand.name}" to ${show(out)}: ${written
            .map((p) => relative(out, p))
            .join(', ')}`
        : `"${brand.name}" unchanged in ${show(out)}`
    );
    return true;
  } catch (e) {
    report(e);
    return false;
  }
};

const ok = await build();

if (!flags.watch) process.exit(ok ? 0 : 1);

/*
 * Watches the brand file's folder, not only the file, so a brand that
 * imports another (a shared base) rebuilds when either changes. The output
 * folder is skipped, or every build would trigger the next.
 */
const SOURCES = new Set([
  '.ts',
  '.mts',
  '.cts',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
]);
let timer: NodeJS.Timeout | undefined;
let running = false;
let again = false;
const rebuild = async () => {
  if (running) {
    again = true;
    return;
  }
  running = true;
  do {
    again = false;
    await build();
  } while (again);
  running = false;
};
watch(dirname(brandFile), (_, name) => {
  if (!name || !SOURCES.has(extname(name))) return;
  const path = resolve(dirname(brandFile), name);
  const inOut =
    lastOut &&
    lastOut !== dirname(brandFile) &&
    !relative(lastOut, path).startsWith('..');
  if (inOut || path === lastOut) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    rebuild().catch(report);
  }, 50);
});
console.log(`watching ${show(dirname(brandFile))} for changes`);
