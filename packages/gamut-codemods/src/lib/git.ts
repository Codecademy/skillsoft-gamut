import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/*
  The CLI refuses to write into a dirty tree, so `git checkout .` always
  undoes a run completely and the codemod's diff never mixes with work in
  progress. Returns a reason to refuse, or null if it's safe.
*/
export const dirtyTreeReason = (target: string) => {
  const cwd = fs.statSync(target).isDirectory() ? target : path.dirname(target);
  let status: string;
  try {
    /* execFileSync with an argument array: no shell, so paths can't inject. */
    status = execFileSync('git', ['status', '--porcelain', '--', '.'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return `${target} is not inside a git repository, so a run couldn't be undone.`;
  }
  if (status.trim()) {
    return `${target} has uncommitted changes. Commit or stash them first, so the codemod's diff stands on its own.`;
  }
  return null;
};
