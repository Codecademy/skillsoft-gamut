import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { dirtyTreeReason } from './git';

const tmp = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'gamut-codemods-test-'));

describe('dirtyTreeReason', () => {
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', args, { cwd, stdio: 'ignore' });

  it('refuses outside a git repo, and on uncommitted changes', () => {
    const dir = tmp();
    expect(dirtyTreeReason(dir)).toMatch(/not inside a git repository/);

    git(dir, 'init', '-q');
    fs.writeFileSync(path.join(dir, 'a.ts'), '');
    expect(dirtyTreeReason(dir)).toMatch(/uncommitted changes/);

    git(dir, 'add', '-A');
    git(dir, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'x');
    expect(dirtyTreeReason(dir)).toBeNull();
  });
});
