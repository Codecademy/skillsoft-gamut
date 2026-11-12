import type { Collection, JSCodeshift } from 'jscodeshift';

import type { Leftover } from './leftovers';
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

/*
  `M` is the preset's manifest type. It defaults to scope-swap's Manifest, so
  migrations written for that preset don't name it.
*/
export interface SourceContext<M = Manifest> {
  j: JSCodeshift;
  root: Collection;
  source: string;
  manifest: M;
  warn: Warn;
  note: Note;
}

export interface Edit {
  start: number;
  end: number;
  text: string;
}

interface MigrationBase<M = Manifest> {
  name: string;
  description: string;
  /*
    Checked once per run, before any file is touched. Return a reason to
    skip this migration for the whole run (the CLI prints it and notes
    `skipped:<name>`), or null to run it.
  */
  skipReason?(roots: string[], manifest: M): string | null;
}

/*
  Mutates the shared AST. Use for structural rewrites only: recast reprints
  whatever it thinks changed, and in semicolon-less files that has spread to
  neighbouring statements. Return true if anything changed.
*/
export interface AstMigration<M = Manifest> extends MigrationBase<M> {
  kind: 'ast';
  run(ctx: SourceContext<M>): boolean;
  /* Formatting fixes on the printed output that the AST can't express. */
  postPrint?(source: string, ctx: { manifest: M }): string;
}

/*
  Uses the AST to find ranges, then edits the original text by offset. The
  default for anything that swaps one string for another.
*/
export interface SpliceMigration<M = Manifest> extends MigrationBase<M> {
  kind: 'splice';
  edits(ctx: SourceContext<M>): Edit[];
}

/* Gets raw text for non-source files (package.json, .eslintrc, .mdx). */
export interface FileMigration<M = Manifest> extends MigrationBase<M> {
  kind: 'file';
  /*
    Not `match`: CodeQL reads `migration.match(file)` as
    String.prototype.match on a CLI argument and flags it as regex injection.
  */
  appliesTo(path: string): boolean;
  run(ctx: {
    source: string;
    manifest: M;
    warn: (message: string) => void;
    note: Note;
    /*
      Runs the preset's source migrations (respecting --only) over a
      snippet of JS/TS, for files that embed code, like MDX's ESM blocks.
    */
    transformSource: (code: string) => string;
  }): string | null;
}

export type SourceMigration<M = Manifest> =
  | AstMigration<M>
  | SpliceMigration<M>;
export type Migration<M = Manifest> = SourceMigration<M> | FileMigration<M>;

export interface Preset<M = Manifest> {
  name: string;
  description: string;
  manifest: M;
  /*
    The cheap pre-filter every caller uses, so big repos don't parse every
    file: false means no migration in this preset could change `source`.
  */
  mentions(source: string): boolean;
  /* After a write run, what's left for a person. Omit for no report. */
  leftovers?(roots: string[]): Leftover[];
  /* Run in order. All `ast` migrations must come before any `splice` one. */
  migrations: Migration<M>[];
  /* Printed at the end of every run. */
  checklist: string[];
  /* Printed only when a migration calls note(key). */
  conditionalChecklist: Record<string, string>;
}
