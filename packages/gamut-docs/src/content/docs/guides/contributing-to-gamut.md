---
title: Contributing to Gamut
description: How to propose, build, and document changes to Gamut.
---

## Prework

We track planned work for Gamut components in the [Gamut Board](https://skillsoftdev.atlassian.net/jira/software/c/projects/GMT/boards/3655/backlog) on JIRA.

- If there's a ticket there you want to take on, send a Slack message to `#gamut-team` or come to Gamut Office Hours to talk it through.
- If the work you'd like to do isn't captured in a JIRA ticket, talk to us first and we'll help create one.
- To request work be done, discuss it with us on Slack or during Gamut Office Hours.
- To pitch a change to the design system, attend Gamut Crit, come to Gamut Office Hours, or message `#gamut-team`.

## Writing components

### Component structure

Create your component as an `index.tsx` file in a PascalCase-named folder within its package directory — for example, `packages/gamut/src/ProgressBar/index.tsx`. Consider saving this shape as an editor snippet:

```tsx
import React from 'react';

export type MyComponentProps = {
  /* ... */
};

export const MyComponent: React.FC<MyComponentProps> = (
  {
    /* ... */
  }
) => {
  // ...
};
```

Naming, code comments, formatting, and linking conventions all live in the [Writing guidance](/guides/writing-guidance/) guide — read it before writing or revising a component, its props, or its documentation.

### Props documentation

Add a [JSDoc](https://jsdoc.app/) comment to a prop unless it's widespread and self-documenting, like `onClick`. These comments show up in TypeScript on hover, and in the props table of the component's Storybook story:

```tsx
export type ButtonProps = {
  /**
   * The visual style variant of the button.
   */
  variant: 'primary' | 'secondary';

  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;
};
```

- Write full sentences.
- Start a boolean's description with "Whether".
- Document which props are required versus optional, and include type information.
- Use your judgment on borderline cases — when unsure, include the comment.

### Unit tests

Add unit tests in a `__tests__/MyComponent-test.tsx` file within the component's directory, using `setupRtl` from `gamut-tests`. Unit test all component logic, with the exception of class names on components that already contain other tested logic.

## Writing stories

Every component needs Storybook stories demonstrating its use, in a `.stories.tsx` file alongside a `.mdx` documentation file. This structure is the source every component page's `StoryEmbed`s pull from, so both files need to stay accurate. File structure and naming conventions live in the [Writing guidance](/guides/writing-guidance/) guide.

### Writing the `.mdx` documentation file

A component's `.mdx` file combines its interactive stories with written documentation, usage guidance, and metadata. A good one has four parts:

1. **General information** — set in the file's `parameters` object: `title` (the component's name, used for linking), `subtitle` (what it does and when to reach for it), `source` (its package and a GitHub link), `design` (a Figma link), and `status`:
   - `current` — stable, recommended for use.
   - `updating` — in progress; the API may still change.
   - `deprecated` — still supported, but slated for removal — don't use it for new work.
   - `static` — reference material, with no active development.
2. **Flagship story and props** — a single default story showing the component's baseline state, with `sourceState="shown"` on its `Canvas` so the code is visible, and a connected props table right below it.
3. **Variation stories** — a subsection per meaningful behavior or configuration, each showing one variation with a short description and any variant-specific guidance.
4. **Usage instructions** — when to use the component (and when not to), plus any guidelines a reader should follow.

### Writing the `.stories.tsx` code file

Use concrete, realistic example values instead of placeholders like `foo`/`bar` — a boolean controlling a modal should be named `isModalOpen`, not `isBar`, so the example reads like something a consumer would actually write.

Don't abstract a story's rendering into a separate helper component just to stay DRY — Storybook's "Show code" button can't see through that abstraction, so a reader who wants to copy the example gets an unhelpful stub instead of working code:

```tsx
// Avoid: hides the real code behind an abstraction
export const Default: Story = {
  render: (args) => <InfoTipExample {...args} />,
};

// Prefer: the actual code a reader can copy and use
export const Default: Story = {
  render: (args) => (
    <FlexBox center m={24} py={64}>
      <Text mr={4}>Some text that needs info</Text>
      <InfoTip {...args} />
    </FlexBox>
  ),
};
```

### Group overview pages

When a folder holds more than one related component or story, add an `About.mdx` file as its landing page — for example, the Icons folder's `About.mdx` links out to its Mini and Regular sub-pages. Give it a clear overview of what the folder contains and how its components relate, organized by importance or usage frequency, and keep it concise — it's an entry point, not detailed documentation.

## Pull requests

Fill out the pull request template, including links to the corresponding design file and JIRA ticket.

:::tip
Use a [draft PR](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests#draft-pull-requests) to run CI jobs without requesting review — that still deploys a Netlify preview and publishes alpha package versions to npm.
:::

### Publishing updates with breaking changes

If your PR has breaking changes affecting at least one downstream repository — for example, `codecademy-engineering/mono`:

1. Before merging, open PRs in those downstream repositories using your PR's published alpha package versions.
2. Verify those PRs work as expected and get them signed off normally.
3. Merge your Gamut PR.
4. Once the new Gamut package publishes, update the downstream PRs to use it.
5. Merge and deploy those PRs as soon as possible.

If a breaking change might affect other users beyond those you've already coordinated with, mention it in `#frontend` too.
