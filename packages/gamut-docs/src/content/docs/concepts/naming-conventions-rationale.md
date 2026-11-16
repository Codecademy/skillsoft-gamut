---
title: Naming conventions rationale
description: Why Gamut's naming conventions land where they do, not just what they are.
---

The [Writing guidance](/guides/writing-guidance/) guide has the naming rules themselves. This page provides our reasoning behind the ones that aren't self-evident from the rule alone.

## Using native HTML attributes

This practice is using vocabulary readers already know from having worked with HTML. Let's use `disabled` as an example, it makes it so that an interactive element isn't interactive anymore. However, there are other aspects that we don't want like the removal of an element from the tab order entirely. What we usually want is the disabled styling, plus `aria-disabled`, plus an `aria-describedby` tooltip explaining why the control is unavailable. Thefore, naming the prop `disabled` anyway means a developer who already knows HTML can quickly implement these features with a prop they're already familiar with.

However, some HTML native prop name are ambiguous — it's hard to know from the name alone what the job of the prop is. For instance, `open` reads as a verb, with nothing in the word itself signaling that it's a boolean rather than a function to call. In this case, we'd opt for readability, using `isOpen` instead of `open` to ensure developers aren't confused by what the prop does.

## Using enums for props that can take on multiple different values

Using enums to for props where it can take on different values makes it easier to ensure that the set styling is correct.

Let's explain using an example, if we use props such like `isPrimary` and `isSecondary` then we could end up with a situation that both can be `true` at the same time — which is very likely not the intended effect. Using a ``variant: 'primary' | 'secondary'` prevents this combination and gives an extra assurance from TypeScript this prop will only allow for the correct enums.

## Using the prodominent state

If a prop is used to determine the state of the component, consider what the default state of that component is supposed to be, and name the prop (and its default) around that state rather than its opposite.

Let's explore using an example: `hideLabel` on `ConnectedFormGroup` has no default, so it's falsy until a caller sets it — the label shows by default, the predominant state here. Hiding it is the deliberate exception, and even then nothing is torn down: a hidden label still renders for screen readers instead of disappearing outright. Naming the prop after the exception, not the common case, means `false` doesn't need a comment to explain what it does.

## Naming the interface, not the implementation

`size="sm"` describes what the prop controls, not how it's built, so it keeps meaning the same thing even if the implementation behind "small" changes later. `smallVariant` or `useSmallStyles` name how "small" happens to be built today instead — the moment that changes, a name like `useSmallStyles` becomes actively wrong.

## Staying correct in both reading directions

Gamut prop values name inline positions with `start` and `end`: `iconPosition="start"`, `labelSide="end"`, `menuAlignment="end"`. Compound placements make only their inline half logical, so `PopoverContainer` takes `alignment="top-start"` and `ToolTip` takes `alignment="end-center"`. `start` is the side where reading begins, which is the left in a left-to-right (LTR) layout and the right in a right-to-left (RTL) layout. Because the value names a position relative to the reading direction instead of the screen, the same value is correct in both directions with no conditional logic in the calling code.

We use `start`/`end` instead of `leading`/`trailing` because many of these values pass straight through to CSS, where `text-align: start` and `justify-content: end` are valid and `leading` isn't. A DataList column's `justify` value, for example, goes directly to the cell's `textAlign` with no lookup table in between.

These values used to be `left` and `right`: `iconPosition="left"`, `buttonPlacement="right"`, `alignment="top-left"`. They named a side of the screen, which held up as long as every page read left to right.

Gamut now supports RTL layouts through `GamutProvider`'s `useLogicalProperties`, and physical names break there. On a mirrored page, an icon set with `iconPosition="left"` renders on the right, so the value describes the wrong side. Components that mirror their placement had to document `left` as meaning the start side, and the `Popover` component's `align` docs did exactly that, leaving the name and the behavior in disagreement. With `start` and `end`, the name matches what renders in either direction.

Physical sides still exist inside the implementation. `Popover` and `PopoverContainer` measure the target in physical screen coordinates, so they resolve `start` to `left` or `right` from the target's reading direction before positioning. Callers only ever pass the logical value.

## Names you can act on

`Container` and `Wrapper` describe the shape of the code, not what it's for. Both just mean something wraps something else. Six months later, nobody can tell from the name alone whether it's safe to delete, safe to reuse, or load-bearing for three other components. `SkipToContent` or `RadialProgress` answers that question on sight. Matching the folder, file, and export to the same name keeps that answer one lookup away, whether someone arrives at the file through an import statement, a fuzzy search, or jump-to-definition.
