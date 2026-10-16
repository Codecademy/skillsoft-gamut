import type { ASTPath, JSXAttribute, JSXOpeningElement } from 'jscodeshift';

import { nameOf } from '../../lib/module-strings';
import type { AstMigration, Warn } from '../../lib/types';

/*
  Markdown used to render <iframe> and <video> tags through Video by default.
  Now they render as plain tags unless the override is passed. So each
  <Markdown> that didn't opt out gets iframeOverride / videoOverride added,
  with Iframe and MarkdownVideo imported from the Video subpath. That keeps
  what it rendered before.

  skipDefaultOverrides.iframe and .video were removed, so those keys go. A
  skip of `true` turned the override off, so it becomes `iframeOverride={undefined}`.
  That's the same as the new default, but written out. Without it a second
  run would read the bare element as a legacy one and turn the override back
  on, and the migration has to be safe to run twice.

  Anything it can't follow (a skipDefaultOverrides that isn't an object
  literal, or a non-literal iframe / video value) is left alone with a
  warning.

  Written against the old @codecademy names, like the rest of the presets:
  scope-rename runs last and moves the Video import to @skillsoft.
*/

const MARKDOWN_MODULE = '@codecademy/gamut';
const VIDEO_MODULE = '@codecademy/gamut/Video';

const OVERRIDES = [
  { skip: 'iframe', prop: 'iframeOverride', component: 'Iframe' },
  { skip: 'video', prop: 'videoOverride', component: 'MarkdownVideo' },
] as const;

type Override = (typeof OVERRIDES)[number];

type Add = Override & { off: boolean };

type Plan = { path: ASTPath<JSXOpeningElement>; adds: Add[] };

/* Reads an object key as a string, whether it's `iframe` or `'iframe'`. */
const keyOf = (key: { type: string; name?: string; value?: unknown }) =>
  typeof key.value === 'string' ? key.value : nameOf(key);

/* Reads a `true` / `false` literal, or undefined for anything else. */
const boolOf = (value: { type: string; value?: unknown }) =>
  typeof value.value === 'boolean' ? value.value : undefined;

/*
  Strips the skip keys this migration owns out of the skipDefaultOverrides
  object. Returns what they were set to, and the keys it couldn't read.
*/
const readSkips = (
  el: JSXOpeningElement,
  skipAttr: JSXAttribute,
  warn: Warn
) => {
  const skips = new Map<string, boolean>();
  const unreadable = new Set<string>();
  const value = skipAttr.value;

  if (
    value?.type !== 'JSXExpressionContainer' ||
    value.expression.type !== 'ObjectExpression'
  ) {
    warn(
      el,
      'skipDefaultOverrides is not an object literal, so iframe and video were not checked. Add iframeOverride / videoOverride by hand.'
    );
    return { skips, unreadable: new Set(['iframe', 'video']), removed: false };
  }

  const object = value.expression;
  const before = object.properties.length;
  object.properties = object.properties.filter((prop) => {
    if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') return true;
    const key = keyOf(prop.key as { type: string; name?: string });
    if (key !== 'iframe' && key !== 'video') return true;

    const literal = boolOf(prop.value as { type: string; value?: unknown });
    if (literal === undefined) {
      warn(
        el,
        `skipDefaultOverrides.${key} is not a boolean literal, so the ${key} override was not added. Check it by hand.`
      );
      unreadable.add(key);
      return true;
    }
    skips.set(key, literal);
    return false;
  });

  return {
    skips,
    unreadable,
    removed: object.properties.length !== before,
  };
};

export const markdownVideoOverrides: AstMigration = {
  name: 'markdown-video-overrides',
  kind: 'ast',
  description:
    'Pass iframeOverride / videoOverride to <Markdown> so iframes and videos still render through Video, and drop the removed skipDefaultOverrides.iframe / .video keys.',
  run({ j, root, warn, note }) {
    const markdownImports = root.find(j.ImportDeclaration, {
      source: { value: MARKDOWN_MODULE },
    });
    const markdownLocals = new Set<string>();
    markdownImports.forEach((p) => {
      for (const spec of p.node.specifiers ?? []) {
        if (
          spec.type === 'ImportSpecifier' &&
          nameOf(spec.imported) === 'Markdown'
        ) {
          markdownLocals.add(nameOf(spec.local ?? spec.imported));
        }
      }
    });
    if (markdownLocals.size === 0) return false;

    const elements = root
      .find(j.JSXOpeningElement)
      .filter((p) => markdownLocals.has(nameOf(p.node.name)));
    if (elements.size() === 0) return false;

    /* Video imports the file already has, by exported name -> local name. */
    const bound = new Map<string, string>();
    root
      .find(j.ImportDeclaration, { source: { value: VIDEO_MODULE } })
      .forEach((p) => {
        for (const spec of p.node.specifiers ?? []) {
          if (spec.type !== 'ImportSpecifier') continue;
          bound.set(nameOf(spec.imported), nameOf(spec.local ?? spec.imported));
        }
      });

    /*
      A different import already called Iframe or MarkdownVideo. Adding ours
      would shadow it, so stop and leave the file for a hand rewrite.
    */
    const clash = root.find(j.ImportSpecifier).filter((p) => {
      const local = nameOf(p.node.local ?? p.node.imported);
      return OVERRIDES.some(
        ({ component }) => local === component && bound.get(component) !== local
      );
    });
    if (clash.size() > 0) {
      warn(
        clash.nodes()[0],
        'a different import already uses the name Iframe or MarkdownVideo, so the <Markdown> overrides were not added. Rewrite them by hand.'
      );
      return false;
    }

    let changed = false;
    const plans: Plan[] = [];
    elements.forEach((path) => {
      const el = path.node;
      const attrs = el.attributes ?? [];
      const skipAttr = attrs.find(
        (a): a is JSXAttribute =>
          a.type === 'JSXAttribute' && nameOf(a.name) === 'skipDefaultOverrides'
      );

      let skips = new Map<string, boolean>();
      let unreadable = new Set<string>();
      if (skipAttr) {
        const read = readSkips(el, skipAttr, warn);
        ({ skips, unreadable } = read);
        if (read.removed) changed = true;

        const value = skipAttr.value;
        if (
          value?.type === 'JSXExpressionContainer' &&
          value.expression.type === 'ObjectExpression' &&
          value.expression.properties.length === 0
        ) {
          el.attributes = attrs.filter((a) => a !== skipAttr);
          changed = true;
        }
      }

      const present = new Set(
        (el.attributes ?? []).map((a) =>
          a.type === 'JSXAttribute' ? nameOf(a.name) : ''
        )
      );
      const adds = OVERRIDES.filter(
        ({ skip, prop }) => !unreadable.has(skip) && !present.has(prop)
      ).map((o) => ({ ...o, off: skips.get(o.skip) === true }));
      if (adds.length > 0) plans.push({ path, adds });
    });

    if (plans.length > 0) {
      const names = new Set(
        plans.flatMap((p) =>
          p.adds.filter((o) => !o.off).map((o) => o.component)
        )
      );
      const local = new Map<string, string>();
      const missing: string[] = [];
      for (const name of names) {
        if (bound.has(name)) local.set(name, bound.get(name) as string);
        else {
          local.set(name, name);
          missing.push(name);
        }
      }

      if (missing.length > 0) {
        const specifiers = missing.map((name) =>
          j.importSpecifier(j.identifier(name))
        );
        const existing = root
          .find(j.ImportDeclaration, { source: { value: VIDEO_MODULE } })
          .nodes()
          .find(
            (n) =>
              (n.importKind ?? 'value') === 'value' &&
              (n.specifiers ?? []).every((s) => s.type === 'ImportSpecifier')
          );
        if (existing) {
          (existing.specifiers as unknown[]).push(...specifiers);
        } else {
          markdownImports
            .paths()[0]
            .insertAfter(
              j.importDeclaration(specifiers, j.stringLiteral(VIDEO_MODULE))
            );
        }
      }

      for (const { path, adds } of plans) {
        for (const { prop, component, off } of adds) {
          const value = off
            ? j.identifier('undefined')
            : j.objectExpression([
                j.property(
                  'init',
                  j.identifier('component'),
                  j.identifier(local.get(component) as string)
                ),
              ]);
          path.node.attributes = [
            ...(path.node.attributes ?? []),
            j.jsxAttribute(
              j.jsxIdentifier(prop),
              j.jsxExpressionContainer(value)
            ),
          ];
        }
      }
      if (names.size > 0) note('video-peers');
      changed = true;
    }

    return changed;
  },
  /*
    Same recast gap as moved-exports: the blank line after the Markdown import
    gets copied onto the new Video import. Close only that gap.
  */
  postPrint(source) {
    return source.replace(
      /(from '@codecademy\/gamut';?)\n\n(import [^\n]*from '@codecademy\/gamut\/Video';?)/g,
      '$1\n$2'
    );
  },
};
