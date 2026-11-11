---
title: Border
description: System props for border width, style, and radius on any side.
sidebar:
  order: 5
---

Border props add and style borders on any side of an element, with directional props and horizontal/vertical shorthands. `borderRadius` references the theme's `borderRadii` scale.

```tsx
const BorderExample = styled.div(system.border);

<BorderExample
  border={1}
  borderLeft="none"
  borderRightStyle="dotted"
  borderRadius="md"
/>;
```

These props support both physical and logical CSS properties, resolved by `useLogicalProperties` on `GamutProvider` — see [Migrating to logical properties](/guides/migrating-to-logical-properties/).

For every prop in this group — its CSS properties, scale, and transform — see the [Border prop table](https://gamut.codecademy.com/?path=/docs/foundations-system-props-border--docs) in Storybook.
