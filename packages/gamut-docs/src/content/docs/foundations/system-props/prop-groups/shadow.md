---
title: Shadow
description: System props for box and text shadows.
sidebar:
  order: 10
---

Shadow props add box and text shadows, using standard CSS shadow syntax.

```tsx
const ShadowExample = styled.div(system.shadow);

<ShadowExample
  boxShadow="0 0 4px rgba(0, 0, 0, .15)"
  textShadow="0 0 4px rgba(0, 0, 0, .15)"
/>;
```

For every prop in this group — its CSS properties, scale, and transform — see the [Shadow prop table](https://gamut.codecademy.com/?path=/docs/foundations-system-props-shadow--docs) in Storybook.
