# `gamut-tests`

Shared component test setup for Gamut applications. ✨

A wrapper around [`component-test-setup`](https://github.com/Codecademy/component-test-setup) that wraps the node with an `@emotion/react`+`gamut-styles` `<ThemeProvider theme={theme}>`.
Use this instead of `component-test-setup` to test Gamut components in Gamut apps!

## Usage

The API is functionally the same `component-test-setup`:

```tsx
import { setupRtl } from '@skillsoft/gamut-tests';

const renderView = setupRtl(MyComponent, { prop: true });

const { view } = renderView();
```
