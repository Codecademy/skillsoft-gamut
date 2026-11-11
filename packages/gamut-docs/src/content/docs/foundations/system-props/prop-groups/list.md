---
title: List
description: System props for list markers and their position.
sidebar:
  order: 11
---

List props adjust bullet styles, positioning, and custom marker images when a component renders as a `ul` or `ol`. For richer list features, see [List](/components/data-display/list-and-tables/list/list/).

```tsx
const ListExample = styled.div(system.list);

<ListExample
  as="ul"
  listStyleType="square"
  listStylePosition="inside"
  listStyleImage="none"
>
  <ListExample as="li">a list item</ListExample>
</ListExample>;
```

For every prop in this group — its CSS properties, scale, and transform — see the [List prop table](https://gamut.codecademy.com/?path=/docs/foundations-system-props-list--docs) in Storybook.
