---
'@skillsoft/gamut': minor
---

Component behavior from design's component map that the role swap didn't cover.

- A selected DataList or DataTable row takes the `state-selected` veil over its fill, with the hover veil on top when hovered. `ListRow` takes an `isSelected` prop for the same tint.
- Table rows are `surface-raised`, with `surface-sunken` stripes, instead of transparent.
- ProgressBar's label at `large` and `xl` sizes is two-tone: `text-inverse` on the bar and `text-default` where it runs onto the track, so a short bar's label stays readable.
