---
title: Patterns
description: Reusable ways of combining two or more components to solve one recurring interaction problem.
---

A pattern documents how to combine two or more components to solve one recurring interaction problem — for example, a `FillButton` paired with a `Menu` to build a dropdown. It's not a component on its own, and it's not a [guide](/guides/): it exists because getting the combination right (focus order, ARIA wiring, keyboard behavior) takes more care than assembling two components and hoping.

## What makes something a pattern

A composition earns a page here only once it clears all three:

- **It recurs.** The same combination shows up across two or more surfaces or teams — not a one-off guess at something that might get reused.
- **Getting it wrong costs something real.** The risk is accessibility or UX, not just style: a broken focus order, missing ARIA wiring, a keyboard trap.
- **A prop can't fix it.** If the fix is adding a prop to an existing component, that's a component change, not a pattern. Patterns document things Gamut's components don't yet do for you.

A pattern that keeps needing to be documented is usually a missing component. When that's true, the goal is to fold the behavior into the component it's built from and retire the pattern page — not to keep writing about the workaround.

No patterns are documented yet. This section stays empty until a composition clears the bar above.
