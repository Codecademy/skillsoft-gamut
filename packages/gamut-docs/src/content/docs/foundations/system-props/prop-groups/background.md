---
title: Background
description: System props for background images and patterns.
sidebar:
  order: 8
---

Background props control background images and patterns — sizing, positioning, and repetition. For solid background colors, use the [color props](/foundations/system-props/prop-groups/color/) instead.

```tsx
const BackgroundExample = styled.div(system.background);

<BackgroundExample background={`url(${myBg})`} backgroundSize="cover" />;
```

For every prop in this group — its CSS properties, scale, and transform — see the [Background prop table](https://gamut.codecademy.com/?path=/docs/foundations-system-props-background--docs) in Storybook.
