---
title: Positioning
description: System props for position, edges, and stacking order.
sidebar:
  order: 9
---

Positioning props control how an element is placed within its parent and its stacking order — `position`, the individual edge props (or the `inset` shorthand for all four at once), and `zIndex`.

```tsx
const PositioningExample = styled.div(system.positioning);

<PositioningExample position="absolute" zIndex={2} top="0" left="0" />;
```

These props support both physical and logical CSS properties, resolved by `useLogicalProperties` on `GamutProvider` — see [Migrating to logical properties](/guides/migrating-to-logical-properties/).

For every prop in this group — its CSS properties, scale, and transform — see the [Positioning prop table](https://gamut.codecademy.com/?path=/docs/foundations-system-props-positioning--docs) in Storybook.
