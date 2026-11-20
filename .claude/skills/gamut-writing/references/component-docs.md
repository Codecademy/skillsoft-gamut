# Component docs: doc pages and `.stories.tsx` files

Conventions for the two files that document a Gamut component, plus the overview pages that index a category of them.

## Contents

- [Where files go](#where-files-go)
- [The two-file split](#the-two-file-split)
- [Frontmatter and header](#frontmatter-and-header)
- [Section backbone for a component page](#section-backbone-for-a-component-page)
- [Writing each section](#writing-each-section)
- [Embeds and asides](#embeds-and-asides)
- [Linking](#linking)
- [Story files (`.stories.tsx`)](#story-files-storiestsx)
- [Overview pages](#overview-pages)
- [Editor snippets](#editor-snippets)

## Where files go

A component's two files live in different packages:

| File       | Path                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| Doc page   | `packages/gamut-docs/src/content/docs/components/<category>/<component-name>.mdx` |
| Story file | `packages/<package>/src/<ComponentName>/<ComponentName>.stories.tsx`              |

Doc page categories group components by what they do, not by atomic-design tier: `actions`, `containers`, `data-display`, `feedback`, `inputs-and-forms`, `media-and-assets`, `navigation`, `overlays`, `status`, `typography`, `utilities`. A component family can get its own folder inside a category, such as `actions/Buttons/`.

**Naming:** doc pages use kebab case (`radial-progress.mdx`). Story files use the component's `PascalCase` name (`RadialProgress.stories.tsx`).

A page added under a `components/` category appears in the sidebar automatically. A page added under `guides/` needs its slug added to the `Guides` section of `packages/gamut-docs/astro.config.mjs`.

## The two-file split

| File           | Holds                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| `.stories.tsx` | The working examples: every rendered variation, in Component Story Format |
| `.mdx`         | The written documentation and the prose around each example               |

The doc page shows stories with `<StoryEmbed>`. Prose never lives in the story file, and the doc page never retypes a variation or a props table that a story already shows. Storybook stays the source of truth for reference content.

Storybook also generates a docs page for each story group from the component's props and JSDoc (`tags: ['autodocs']` in `packages/.storybook/preview.ts`). There is no Storybook `.mdx` file to write, so accurate prop JSDoc is what drives that page. See `docs-in-code.md`.

## Frontmatter and header

Frontmatter takes only `title` and `description`. The `description` says what the component is, in one sentence.

The header is a plain-text line directly after the imports, not a component:

```mdx
---
title: Badge
description: A small, read-only label for statuses, attributes, or emphasized information.
---

import FigmaEmbed from '~/components/FigmaEmbed.astro';
import StoryEmbed from '~/components/StoryEmbed.astro';

**Status:** Current · [Figma](https://www.figma.com/file/…?node-id=29959-39721) · [Source](https://github.com/Codecademy/gamut/blob/main/packages/gamut/src/Badge)
```

Status values carry a promise to the reader, so pick deliberately rather than defaulting:

- `Current`: stable, recommended for use
- `Updating`: in progress, the API may change
- `Deprecated`: still supported but slated for deletion; do not use for new work
- `Static`: reference material, no active development

Drop the Figma link when the component has no design file. The Source link points at the component's directory or file on `main`. Build it from the real path on disk.

## Section backbone for a component page

Every component page follows the same order, described for readers in `getting-started/using-this-site.md`:

```
## Usage
**Best practices:**
**When NOT to use:**

## Anatomy              (skipped for non-visual utilities)

## Usage examples       (skipped when there is no state or wiring to show)
### <Goal-first recipe>

## Playground           (when no prop changes the look)
  or
## Prop Reference       (when a prop like variant or size does)
### <Prop name>
#### <Value>
```

Some existing pages nest Anatomy as `### Anatomy` under Usage. Match the neighboring pages in the same category.

Do not add a heading to hold two sentences, and do not include a section because the skeleton lists it. An Anatomy section with no diagram is worse than its absence.

## Writing each section

**`## Usage`** opens with what the component is for, in the form "Use `X` to …":

```markdown
Use `Badge` to display read-only information like statuses, attributes, or other information that needs emphasis.
```

The **Best practices** list is a short bulleted list of real guidance: the things a reviewer would otherwise have to say. Advice that would apply to any component ("use consistently", "consider accessibility") is filler; cut it or make it specific.

The **When NOT to use** list is the highest-value part of the page and the one most often skipped. Each bullet names the case, then routes to the component that actually handles it, linked:

```markdown
**When NOT to use:**

- **Interactive, clickable text** — use a [Button](/components/actions/buttons/) or [Anchor](/components/navigation/anchor/) instead.
- **Labeling or categorizing content** — use [Tag](/components/actions/tag/) instead.
```

Writing this section requires knowing the neighboring components. Look at what else lives in the category and in adjacent categories before claiming a boundary.

**`## Anatomy`** is a Figma frame followed by a numbered list of its parts:

```mdx
<FigmaEmbed url="https://www.figma.com/file/…?node-id=29959-39721" />

1. **Leading icon** (optional) — reinforces the badge's message and improves scannability.
2. **Label** — 1–2 words of read-only status or attribute text.
```

The Figma URL must include a `node-id` for the frame. If there is no frame yet, leave a `TODO:` noting that a designer needs to provide one.

**`## Usage examples`** holds goal-first recipes, each an `###` heading named for what the reader is trying to do ("Handling dismissal", "Removing a tag from a list"). Give each one a sentence on when and why, then its embed. A heading followed only by an embed makes the reader guess.

**`## Prop Reference`** gives each visual prop an `###` heading and each value a `####` heading with its embed. Mark the default value in the heading: `#### Primary (default)`. Use a single `## Playground` embed instead when no prop changes the look.

## Embeds and asides

| Element      | Import                                                   | Use                                                    |
| ------------ | -------------------------------------------------------- | ------------------------------------------------------ |
| `StoryEmbed` | `import StoryEmbed from '~/components/StoryEmbed.astro'` | A live story canvas; takes `id` and optional `height`  |
| `FigmaEmbed` | `import FigmaEmbed from '~/components/FigmaEmbed.astro'` | An anatomy diagram; takes a Figma `url` with `node-id` |
| `Aside`      | `import { Aside } from '@astrojs/starlight/components'`  | A tip or caveat worth interrupting for                 |

```mdx
<StoryEmbed id="status-badge--secondary" height="4rem" />
```

Story ids are exact strings: the meta's `title` and the story's export name, both kebab-cased and joined with `--`. Run `yarn start:storybook` and copy the id from the address bar rather than deriving it by hand. A wrong id renders an empty frame.

In `.md` pages, which cannot import components, use Starlight's `:::tip` or `:::caution` blocks instead of `Aside`.

## Linking

**Internal**: a root-relative Markdown link to the page's path on the docs site.

```markdown
[ColorMode](/concepts/color-modes/)
```

Open the target file to confirm the path rather than guessing it. Paths follow the folders under `src/content/docs/`, lowercased.

**External**: plain Markdown links.

```markdown
[GitHub Repository](https://github.com/Codecademy/skillsoft-gamut)
```

## Story files (`.stories.tsx`)

Stories follow Storybook's [Component Story Format](https://storybook.js.org/docs/api/csf) and its [TypeScript guidance](https://storybook.js.org/docs/writing-stories/typescript). One story per variation or behavior.

```tsx
import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Status/Badge',
  component: Badge,
  args: {
    variant: 'primary',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'New',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Beta',
    variant: 'secondary',
  },
};
```

Set `title` to the doc page's category and component name, in sentence case (`'Inputs & forms/Radio'`), so the Storybook sidebar matches the docs site. Import the component with a relative path, not from `@skillsoft/gamut`.

**Use concrete values.** Never `foo`, `bar`, or `isBar`. Pick values from a setting the component would really appear in: a boolean is `isModalOpen`, a badge says `Beta`, a label says **Save changes**. Placeholder names make a reader translate before they can evaluate, and they make the copied snippet worse.

**Keep each story self-contained.** This is the rule that most often gets broken, and the reason is not obvious: when a reader clicks **Show code**, Storybook prints the story's source, and it does not follow abstractions. A story that renders a wrapper component shows the reader the wrapper, not the code they need. Repetition across stories is the correct trade: every story should be copy-pasteable into a project as-is.

```tsx
// ❌ Show code prints <InfoTipExample {...args} /> — useless to the reader
export const Default: Story = {
  render: (args) => <InfoTipExample {...args} />,
};
```

```tsx
// ✅ Show code prints the actual usage
export const Default: Story = {
  render: (args) => (
    <FlexBox center m={24} py={64}>
      <Text mr={4}>Some text that needs info</Text>
      <InfoTip {...args} />
    </FlexBox>
  ),
};
```

Prefer `args` alone for simple variations, and add `render` only when the example needs surrounding markup or layout to make sense.

Story export names become the story ids the doc page embeds, so name them after the behavior they show: `Secondary`, `SmallSizeWithIcon`, `WithCloseButton`, `Dismissible`. Renaming an export breaks every `StoryEmbed` that points at it, so search `packages/gamut-docs` for the old id first.

## Overview pages

When a category folder holds more than one component, its `index.md` (or `index.mdx`) is the landing page, an entry point rather than detailed documentation. Give it `sidebar: { label: Overview }` in frontmatter; `components/navigation/index.md` is a reference.

Write a short overview of what the category contains and how the components relate, order the list by importance or usage frequency, and stop there.

## Editor snippets

`.vscode/stories.code-snippets` provides a `component-story` scaffold for the `.stories.tsx` skeleton. Mention it to a human who is writing stories by hand. The template in this reference reflects the same structure, so there is no need to expand the snippet when writing files directly.
