import type { Collection, JSCodeshift } from 'jscodeshift';

import type { Manifest } from './manifest';

/* Anything with a source location, so warnings can point at a line. */
export type Locatable =
  | { loc?: { start: { line: number } } | null }
  | null
  | undefined;

export type Warn = (node: Locatable, message: string) => void;

/*
  Records that a checklist item applies to this run. Keys are defined by the
  preset; the CLI prints the matching items once every file is done.
*/
export type Note = (checklistKey: string) => void;

export interface SourceContext {
  j: JSCodeshift;
  root: Collection;
  source: string;
  manifest: Manifest;
  warn: Warn;
  note: Note;
}

export interface Edit {
  start: number;
  end: number;
  text: string;
}

interface MigrationBase {
  name: string;
  description: string;
}

/*
  Mutates the shared AST. Use for structural rewrites only: recast reprints
  whatever it thinks changed, and in semicolon-less files that has spread to
  neighbouring statements. Return true if anything changed.
*/
export interface AstMigration extends MigrationBase {
  kind: 'ast';
  run(ctx: SourceContext): boolean;
  /* Formatting fixes on the printed output that the AST can't express. */
  postPrint?(source: string, ctx: { manifest: Manifest }): string;
}

/*
  Uses the AST to find ranges, then edits the original text by offset. The
  default for anything that swaps one string for another.
*/
export interface SpliceMigration extends MigrationBase {
  kind: 'splice';
  edits(ctx: SourceContext): Edit[];
}

/* Gets raw text for non-source files (package.json, .eslintrc). */
export interface FileMigration extends MigrationBase {
  kind: 'file';
  match(path: string): boolean;
  run(ctx: {
    source: string;
    manifest: Manifest;
    warn: (message: string) => void;
    note: Note;
  }): string | null;
}

export type SourceMigration = AstMigration | SpliceMigration;
export type Migration = SourceMigration | FileMigration;

export interface Preset {
  name: string;
  description: string;
  manifest: Manifest;
  /* Run in order. All `ast` migrations must come before any `splice` one. */
  migrations: Migration[];
  /* Printed at the end of every run. */
  checklist: string[];
  /* Printed only when a migration calls note(key). */
  conditionalChecklist: Record<string, string>;
}
