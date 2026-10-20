import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { API, FileInfo } from 'jscodeshift';
import jscodeshift from 'jscodeshift';

import { main } from '../cli';
import transform, { type TransformOptions } from '../transform';

/*
  Drives the real CLI. jscodeshift's Runner normally spawns workers that
  load a built transform.js; here it's replaced with an in-process loop
  over the same transform, so these tests run against source and count
  toward coverage. The factory only builds a wrapper, so the mock reference
  is resolved at call time.
*/
const mockRun = jest.fn();
jest.mock('jscodeshift/src/Runner', () => ({
  run: (...args: unknown[]) => mockRun(...args),
}));

const SOURCE_EXT = /\.(m?[jt]sx?|c[jt]s)$/;

const listSources = (target: string): string[] =>
  fs.statSync(target).isDirectory()
    ? fs
        .readdirSync(target)
        .filter((name) => name !== 'node_modules')
        .flatMap((name) => listSources(path.join(target, name)))
    : SOURCE_EXT.test(target)
    ? [target]
    : [];

const simulateRunner = async (
  _transformFile: string,
  paths: string[],
  options: Record<string, unknown>
) => {
  const api = {
    jscodeshift: jscodeshift.withParser('tsx'),
    report: (message: string) => console.log(message),
    stats: () => {},
  };
  for (const file of paths.flatMap(listSources)) {
    const source = fs.readFileSync(file, 'utf8');
    const out = transform(
      { path: file, source } as FileInfo,
      api as unknown as API,
      options as TransformOptions
    );
    if (out && !options.dry) fs.writeFileSync(file, out);
  }
  return { error: 0 };
};

const project = (files: Record<string, string>) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gamut-cli-test-'));
  for (const [name, text] of Object.entries(files)) {
    const file = path.join(dir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  }
  return dir;
};

const read = (dir: string, name: string) =>
  fs.readFileSync(path.join(dir, name), 'utf8');

const POST = `import { Box, Markdown, Video } from '@codecademy/gamut';

export const Post = ({ text, url }: { text: string; url: string }) => (
  <Box>
    <Markdown text={text} />
    <Video videoUrl={url} />
  </Box>
);
`;

let logs: string[];
let errors: string[];

beforeEach(() => {
  logs = [];
  errors = [];
  jest.spyOn(console, 'log').mockImplementation((...args) => {
    logs.push(args.join(' '));
  });
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    errors.push(args.join(' '));
  });
  mockRun.mockReset();
  mockRun.mockImplementation(simulateRunner);
});

afterEach(() => {
  jest.restoreAllMocks();
});

const output = () => logs.join('\n');

describe('main: no-op paths', () => {
  it('lists presets and their migrations', async () => {
    expect(await main(['list'])).toBe(0);
    expect(output()).toMatch(/scope-swap/);
  });

  it('prints usage for --help and for a missing path', async () => {
    expect(await main(['--help'])).toBe(0);
    expect(output()).toMatch(/Usage: gamut-codemods/);

    logs = [];
    expect(await main(['scope-swap'])).toBe(1);
    expect(output()).toMatch(/Usage: gamut-codemods/);
  });

  it('rejects an unknown preset', async () => {
    await expect(main(['no-such-preset', '/tmp'])).rejects.toThrow(
      /unknown preset 'no-such-preset'/
    );
  });
});

describe('main: refusing to write', () => {
  it('refuses a target outside git without --force', async () => {
    const dir = project({ 'package.json': '{}' });
    expect(await main(['scope-swap', dir])).toBe(1);
    expect(errors.join('\n')).toMatch(/not inside a git repository/);
    expect(errors.join('\n')).toMatch(/--force/);
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('refuses a dirty git tree without --force', async () => {
    const dir = project({ 'src/a.ts': 'export {};\n' });
    const git = (...args: string[]) =>
      execFileSync('git', args, { cwd: dir, stdio: 'ignore' });
    git('init', '-q');
    expect(await main(['scope-swap', dir])).toBe(1);
    expect(errors.join('\n')).toMatch(/uncommitted changes/);
  });
});

describe('main: full run', () => {
  it('rewrites sources, manifests, and docs, then prints the checklist', async () => {
    const dir = project({
      'src/Post.tsx': POST,
      'docs/story.mdx': "import { Box } from '@codecademy/gamut';\n\n# Hi\n",
      'package.json': JSON.stringify({
        name: 'app',
        dependencies: {
          '@codecademy/gamut': '^73.0.0',
          '@codecademy/gamut-kit': '^73.0.0',
        },
      }),
      'jest.config.js':
        "module.exports = { moduleNameMapper: { '^@codecademy/gamut/(.*)$': '<rootDir>/x/$1' } };\n",
    });

    expect(await main(['scope-swap', dir, '--force'])).toBe(0);

    expect(read(dir, 'src/Post.tsx')).toContain("from '@skillsoft/gamut'");
    expect(read(dir, 'docs/story.mdx')).toContain("'@skillsoft/gamut'");
    expect(read(dir, 'package.json')).toContain('"@skillsoft/gamut"');
    expect(read(dir, 'package.json')).not.toContain('gamut-kit');

    const out = output();
    expect(out).toMatch(/file\(s\) changed/);
    expect(out).toMatch(/leftovers \(\d+\)/);
    expect(out).toMatch(/jest\.config\.js:1/);
    expect(out).toMatch(/next steps/);
    expect(out).toMatch(/gamut-kit is gone/);
    expect(out).toMatch(/Reinstall \(yarn\)/);
  });

  it('flags esmExternals: false in next.config', async () => {
    const dir = project({
      'src/Post.tsx': POST,
      'next.config.js':
        'module.exports = { experimental: { esmExternals: false } };\n',
    });
    expect(await main(['scope-swap', dir, '--force'])).toBe(0);
    expect(read(dir, 'next.config.js')).toContain('esmExternals: false');
    expect(output()).toMatch(/\[next-config\] .*next\.config\.js/);
    expect(output()).toMatch(/Some next\.config files set/);
  });

  it('writes nothing under --dry and skips the checklist and leftovers', async () => {
    const pkg = JSON.stringify({
      dependencies: { '@codecademy/gamut': '^73.0.0' },
    });
    const dir = project({ 'src/Post.tsx': POST, 'package.json': pkg });
    expect(await main(['scope-swap', dir, '--dry'])).toBe(0);
    expect(read(dir, 'src/Post.tsx')).toBe(POST);
    expect(read(dir, 'package.json')).toBe(pkg);
    expect(output()).toMatch(/would update .*package\.json/);
    expect(output()).toMatch(/skipped in --dry/);
    expect(output()).not.toMatch(/next steps/);
  });

  it('skips the leftovers report with --no-report', async () => {
    const dir = project({ 'src/Post.tsx': POST });
    expect(await main(['scope-swap', dir, '--force', '--no-report'])).toBe(0);
    expect(output()).not.toMatch(/leftovers \(/);
    expect(output()).not.toMatch(/leftovers skipped/);
  });

  it('runs only the named migrations with --only', async () => {
    const dir = project({
      'src/Post.tsx': POST,
      'package.json': JSON.stringify({
        dependencies: { '@codecademy/gamut': '^73.0.0' },
      }),
    });
    expect(
      await main(['scope-swap', dir, '--force', '--only=package-json'])
    ).toBe(0);
    expect(read(dir, 'src/Post.tsx')).toBe(POST);
    expect(read(dir, 'package.json')).toContain('"@skillsoft/gamut"');
  });

  it('returns 1 when the source runner reports errors', async () => {
    mockRun.mockResolvedValueOnce({ error: 1 });
    const dir = project({ 'src/Post.tsx': POST });
    expect(await main(['scope-swap', dir, '--force'])).toBe(1);
  });
});
