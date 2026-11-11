---
title: Typography
description: System props for font family, size, weight, and line height.
sidebar:
  order: 3
---

Typography props connect to the theme's font family, size, weight, and line-height scales, alongside text transforms and decorations.

```tsx
const TextExample = styled.p(system.typography);

<TextExample fontSize={16} fontFamily="accent" textTransform="uppercase" />;
```

For every prop in this group — its CSS properties, scale, and transform — see the [Typography prop table](https://gamut.codecademy.com/?path=/docs/foundations-system-props-typography--docs) in Storybook.
