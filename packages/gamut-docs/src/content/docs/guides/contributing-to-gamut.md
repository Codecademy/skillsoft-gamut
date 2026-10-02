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

## Writing stories and documentation

A component needs two things: Storybook stories for interactive reference, and a doc page on this site for a reader deciding whether and how to use it. They live in different packages, so a component change usually touches both.

<!-- TODO: Update once files move to be colocated with components  -->

### Writing the `.stories.tsx` file

Add stories in `packages/styleguide/src/lib/<Tier>/<ComponentName>/ComponentName.stories.tsx`. Storybook builds that story group's docs page automatically from the component's props and JSDoc (`tags: ['autodocs']` in `packages/.storybook/preview.ts`), so a new component needs no Storybook `.mdx` file — accurate [props documentation](#props-documentation) is what drives that page instead.

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

### Writing the component doc page

A component's written documentation lives on this site, not in Storybook. Add `packages/gamut-docs/src/content/docs/components/<category>/<component-name>.mdx`, kebab-case, under whichever [category](/components/) the component belongs to. See [Using this site](/getting-started/using-this-site/) for the five-part structure every component page follows — Header, Usage, Anatomy, Usage examples, and Playground or Prop Reference.

A few things specific to writing one of these pages:

- Frontmatter needs only `title` and `description` — there's no `parameters` object.
- The header is a line of plain text, not a component: `**Status:** <Current|Updating|Deprecated|Static> · [Figma](figma-url) · [Source](github-url)` — drop the Figma link when the component has no design file.
- Pull in a live Storybook example with `<StoryEmbed id="storybook-story-id" height="..." />` instead of retyping a prop table or re-describing a variation — Storybook stays the source of truth for that content. Run `yarn nx run storybook:dev` and copy a story's id from the address bar rather than guessing it.
- Embed a Figma frame for the anatomy diagram with `<FigmaEmbed url="figma-url-with-a-node-id" />`.

A page added under a `components/` category folder appears in the sidebar automatically. A page added under `guides/` doesn't — add its slug by hand to the `Guides` section of `packages/gamut-docs/astro.config.ts`.

### Group overview pages

When a category folder holds more than one component, its `index.md` is the landing page — give it `sidebar: { label: Overview }` in frontmatter (see `packages/gamut-docs/src/content/docs/components/navigation/index.md` for reference). Give it a clear overview of what the category contains and how its components relate, organized by importance or usage frequency, and keep it concise — it's an entry point, not detailed documentation.

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
