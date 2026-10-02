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

Let's explain using an example: `List`, `DataGrid`, and `DataTable` all set `disableContainerQuery` to `false` by default, meaning container queries are on for most consumers. But reading that default means resolving a double negative first — "not disabled" — before you know container queries are actually active.

## Naming the interface, not the implementation

`smallVariant` or `useSmallStyles` describes how "small" happens to be built today. `size="sm"` describes what the prop controls. If the implementation changes later, a name like `useSmallStyles` becomes actively wrong, while `size="sm"` still means the same thing. It never promised anything about the mechanism.

## Staying correct in both reading directions

A property named `left` means something different once a page mirrors for a right-to-left locale — the padding or margin a developer set for one side silently lands on the other. `leading`/`trailing` and `start`/`end` name a position relative to the reading direction instead of the screen, so the same prop value is correct in both directions with no conditional logic to flip it.

## Names you can act on

`Container` and `Wrapper` describe the shape of the code, not what it's for. Both just mean something wraps something else. Six months later, nobody can tell from the name alone whether it's safe to delete, safe to reuse, or load-bearing for three other components. `SkipToContent` or `RadialProgress` answers that question on sight. Matching the folder, file, and export to the same name keeps that answer one lookup away, whether someone arrives at the file through an import statement, a fuzzy search, or jump-to-definition.
