---
title: Z-index
description: The semantic z-index scale for coordinating stacking order across Gamut, and when to reach for `isolation`.
---

`z-index` should only be used when necessary to override the default stacking order — when possible, use the default stacking order and avoid it. When you do need one, reach for `zIndexes`, Gamut's single semantic scale, so stacking order is coordinated by name instead of by scattered magic numbers. Pass a token name directly to the `zIndex` prop:

```tsx
<Box zIndex="modal">…</Box>
```

The token name is the form to reach for by default: it resolves through the theme to a CSS variable (`var(--zIndexes-modal)`), so the value stays live with the theme rather than getting baked in at render time.

## The scale

Values are spaced by 100 so in-between escape-hatch numbers are available.

| Token        | Value | Use for                                                                                                                    |
| :----------- | ----: | :------------------------------------------------------------------------------------------------------------------------- |
| `underlay`   |  -100 | Decorative layer behind content (underlines, backdrops, shadows).                                                          |
| `base`       |     0 | Ground layer — establishes a local stacking context without lifting above siblings.                                        |
| `foreground` |   100 | The raised in-flow layer: content lifted above an `underlay`, and sticky content headers (e.g. a sticky table `thead`).    |
| `floating`   |   200 | Portal floor — the default for `BodyPortal`, and persistent floating page furniture at rest (e.g. an AI chat launcher).    |
| `appBar`     |   300 | Global app header / nav bar. Aliased by the legacy `elements.headerZ` constant.                                            |
| `flyout`     |   400 | Portaled side panel (the `Flyout` component = `Drawer` inside `Overlay`).                                                  |
| `modal`      |   500 | `Overlay`, `Modal`, and `Dialog` (they share one portal primitive).                                                        |
| `popover`    |   600 | Portal-mode `Popover` and the portaled `SelectDropdown` menu — above modal.                                                |
| `topmost`    |   700 | Top-most transient overlays that must never be clipped: floating tooltips and toasts/notifications. Nothing sits above it. |

See [Positioning](/foundations/system-props/#positioning) for the `zIndex`/`isolation` system props themselves.

## Creating a stacking context with `isolation`

A `zIndex` token places an element within its **stacking context** — the scope that z-index competition happens inside. To create that scope, use the `isolation` prop:

```tsx
<Box isolation="isolate">
  <Box position="absolute" zIndex="modal">
    …
  </Box>
</Box>
```

`isolation="isolate"` scopes every descendant `zIndex` to that element, so a child at `modal` (500) can't paint above something outside its parent. It does this without changing the element's positioning or lifting it up the scale — which `position: relative` plus a token would both do.

A common gotcha: `zIndexes.base` (`z-index: 0`) does **not** create a stacking context on its own. `z-index` is ignored entirely on a `position: static` element, so `<Box zIndex="base">` creates no scope. Reach for `isolation="isolate"` when a stacking context is the actual goal.

Use it for components that shouldn't leak their internal layering into the rest of the page — a card, a list row, a widget with overlapping decoration.

## Custom z-index values

Beyond the token-name form above, the `zIndex` prop also accepts a plain number — deliberately, for a value that isn't part of the scale. This is the escape hatch, not the default:

```tsx
import { zIndexes } from '@skillsoft/gamut-styles';

<Overlay zIndex={zIndexes.modal + 5}>…</Overlay>; // just above modal
<Box zIndex={605}>…</Box>; // deliberate one-off
```

These situations should be rare, but when they do arise, use the scale as a reference point rather than picking a number in isolation.

Note the tradeoff: a number — whether a bare literal or arithmetic on `zIndexes.<token>` — is resolved once at render time and baked into the style as a literal integer. Only the string token form (`zIndex="modal"`) resolves to the CSS variable. Reach for `zIndexes.<token>` itself (the plain numeric export) outside the `zIndex` prop too — anywhere you need the actual number in plain JS, such as a canvas/chart library or a third-party component's own z-index option.

## Guidance

- **Reach for a token name first.** `zIndex="modal"`, `zIndex="foreground"`, etc. — the name documents intent far better than a number, and resolves to the theme's CSS variable.
- **Escape hatch sparingly.** A raw number is fine for a genuine one-off, but prefer `zIndexes.<token> ± n` so the relationship to the scale stays visible, and leave a comment.
- **Scope instead of escalating.** If a component's internal layering is fighting the rest of the page, `isolation="isolate"` on its root is usually the fix — not a bigger number.
- **Third-party widgets** (e.g. injected marketing/chat scripts) set their own z-index and are out of Gamut's control; `topmost` is the highest Gamut layer.
- Talk to web platform before adding a new token to the `zIndexes` scale — see [ESLint rules](/foundations/eslint-rules/#gamutno-raw-z-index).
