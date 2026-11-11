---
title: Grid
description: System props for grid templates, placement, and gaps.
sidebar:
  order: 7
---

Grid props control CSS Grid layouts — templates, auto-placement, and gaps between items.

```tsx
const GridExample = styled.div(system.grid);

<GridExample
  gridTemplateColumns="max-content 1fr max-content"
  columnGap={32}
/>;
```

For every prop in this group — its CSS properties, scale, and transform — see the [Grid prop table](https://gamut.codecademy.com/?path=/docs/foundations-system-props-grid--docs) in Storybook.
