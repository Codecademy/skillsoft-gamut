---
title: Space
description: System props for margin and padding on the spacing scale.
sidebar:
  order: 2
---

Space props apply margin and padding consistently, referencing the theme's spacing scale — including responsive array syntax.

```tsx
const SpaceExample = styled.div(system.space);

<SpaceExample p={8} my={[16, 24, 32]} />;
```

These props support both physical and logical CSS properties, resolved by `useLogicalProperties` on `GamutProvider` — see [Migrating to logical properties](/guides/migrating-to-logical-properties/).

For every prop in this group — its CSS properties, scale, and transform — see the [Space prop table](https://gamut.codecademy.com/?path=/docs/foundations-system-props-space--docs) in Storybook.
