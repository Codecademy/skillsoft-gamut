---
title: Writing guidance
description: Naming, comment, formatting, and linking conventions for Gamut code and documentation.
---

## Naming conventions

We’ve established these conventions to help provide guidance on one of the most difficult exercises in programming — naming. These guidelines are not hard and fast rules, they won’t cover every single case, but generally, they will provide a frame of mind to write helpful names for anyone reading this code, including agents.

### Principles

1. Be readable - ensure that the name can be understood by other people, not just your current self.

- Names should serve as self-documentation
- Abbreviations can trip up agents, and even people.

2. Be consistent - there’s a good chance that a name or convention already exists, check for it, use it and continue to use it.

3. Be specific - a name should point to exactly one thing; avoid catch-alls like data, value, or handler.

**Components**

- Use `PascalCase`: `Button`, `UserProfile`, `NavigationMenu`.
- Name the folder to match the component, and the file inside it to match the folder: `Button/Button.tsx`.
- Use names that indicate purpose — `SkipToContent`, `RadialProgress`, `Toggle` — and avoid generic ones like `Component`, `Container`, or `Wrapper` without further context.

**Component Props**

- Use the native HTML attribute name when one exists.
  - e.g. `disabled`, `checked`, `readOnly`, `required`, `hidden`, `value`, `placeholder`, `href`
  - caveat: if an attribute is ambigious, e.g. `open` where it is verb but unclear if it is supposed to be a boolean or function then opt for readability, use `isOpen` since it is supposed to be a boolean value
- Boolean props that don’t have a native attribute should include a prefix: `is`, `has`, `can`, etc... e.g. `isVisible`, `hasWatermark`, `canBeProtected`.
- Array props should be the plural noun. e.g. `books`, `items`, `activeLocations`
- Use an enum over a cluster of exclusive booleans.
  - `variant="primary" | "secondary"` is better than two separate props `isPrimary` + `isSecondary`.
- Event and callback props have an on prefix followed by the event/callback in present tense, e.g. `onChange`, `onClick`, `onClose`, `onSelect`. Same pattern whether the event is native or invented.
- Name the state, not its negation.
  - e.g. `visible`, not `hidden={false}`.
- Name the state for which the component is usually in, and default to that state
  - `visible` (defaulting to `true`) beats `hidden` (defaulting to `false`) when a component is visible most of the time.
- Name what the prop controls, not how it's built. `size="sm"`, not `smallVariant` or `useSmallStyles`.
- Opt for logical property names instead of physical or visual names to allow for RTL conversions
  — `leading`/`trailing` over `left`/`right`, `start`/`end` over `top`/`bottom`

**Variables and constants**

- Use `camelCase`: `userName`, `isLoading`, `itemCount`.
- Use names that reveal purpose: `filteredResults`, not `arr`.
- Prefix booleans with `is`, `has`, `should`, or `can`: `isVisible`, `hasError`, `shouldRender`.
- Use `SCREAMING_SNAKE_CASE` for true constants: `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`.
- Use plural names for arrays and collections: `users`, `menuItems`.

**Functions and methods**

- Use `camelCase`, starting with a verb that describes the action: `get`, `set`, `fetch`, `handle`, `render`, `calculate`.
- Prefix event handlers with `handle`: `handleSubmit`, `handleClickOutside`.
- Phrase a boolean-returning function as a question: `isValidEmail`, `canAccessResource`, `hasPermission`.
- Keep names concise but descriptive: `fetchUserProfile`, not `getUserProfileDataFromAPI`.

## Code comments

Comments should explain _why_ code exists, not _what_ it does — well-named variables and functions already handle the "what." Reserve comments for non-obvious decisions, complex logic, and important context:

```tsx
// Use binary search for O(log n) performance on sorted arrays
const index = binarySearch(sortedArray, target);

// Per WCAG 2.2, focus must return to the trigger element on close
previousFocusRef.current?.focus();

// Safari doesn't support :focus-visible, fallback to :focus
// TODO: Remove when Safari 15+ is the minimum supported version

// Delay state update to avoid a race condition with async validation
setTimeout(() => setIsValid(true), 0);
```

Skip a comment when the code is already self-explanatory:

```tsx
// Avoid: the comment only restates the code
// Set loading to true
setIsLoading(true);

// Prefer: the code is already self-documenting
setIsLoading(true);
```

Delete commented-out code instead of leaving it in place — git already tracks its history.

**Style:** use `//` for single-line comments, with a space after the slashes; use `/** */` JSDoc comments on exports (functions, types, components); write complete sentences with proper punctuation; keep comments up to date as the code changes.

## File structure and naming

The folder structure mirrors both Gamut's atomic-design tiers and the generated Storybook hierarchy. Find the right folder under `packages/styleguide/src/lib` (`Atoms`, `Molecules`, `Organisms`, and so on), then create a new folder containing `ComponentName.stories.tsx` and `ComponentName.mdx` — plus any example or utility files the stories need.

- Non-component files with more than one word use a space and sentence case: `General principles.mdx`.
- Component-related files use the component's own `PascalCase` name: `RadialProgress.mdx`.

## Formatting

**Numbers and units**

- Use numerals for all numbers, with commas for thousands (1,000).
- Use standard units — `px`, `rem`, `em`, `%`.
- In prose, put a space between a number and its unit ("16 pixels"); in code, don't ("16px").

**Lists**

- Bulleted lists are for unordered items — keep them in parallel structure, and end each item with a period only if it's a complete sentence.
- Numbered lists are for sequential steps or prioritized items — start each item with a capital letter.

**Code blocks**

- Use triple backticks with a language identifier (` ```tsx `, ` ```javascript `, ` ```css `).
- Include comments for complex examples, and keep examples concise and focused.

**Headings**

- Start at the second level (`##`) — the first level is set automatically from the page's title.
- Don't skip a heading level; it breaks the reading order.

**Whitespace**

- Separate sections with a blank line, and never stack multiple consecutive blank lines.
- Indent code consistently — 2 spaces for TypeScript/TSX, with tabs set to 2 spaces if you use them.

## Linking

**Internal links**

In Storybook's own `.mdx` files, use the `LinkTo` component with an `id` matching the target story's id:

```tsx
import { LinkTo } from '~styleguide/blocks';

<LinkTo id="Atoms/Animations/About">Animation</LinkTo>;
```

- Link text describes the destination, not the action — "See the Stories page," not "Click here."
- Make link text meaningful out of context: "the Stories page," not "click here."
- Link a component's name to its documentation.
- Verify the link actually works.
- Use at least 2–3 words, so the link is easy to click.
- Give each link unique text when more than one appears on the same page.

**External links**

Use a plain Markdown link for something like an external tool or reference — most renderers already open these in a new tab:

```markdown
[GitHub Repository](https://github.com/Codecademy/gamut)
```

For more control over the link itself — for example, inside a component that needs an `Anchor` — pass `target="_blank"` together with `rel="noreferrer"` for security, but don't force that behavior unless it's actually needed; a reader can already choose to open a link in a new tab themselves.

## Referencing code

**Code in text**

- Use backticks for inline code: props, CSS properties, component names, prop values (`onClick`, `flex-direction`, `Box`, `true`).
- Use backticks for file and package names too: `Button.tsx`, `package.json`, `@skillsoft/gamut`.
- Refer to a component as "the `Box` component" on first mention, then "the component" afterward.
- Keep a component name singular even when referring to several instances — "these `Box` components," not "these `Boxes`."

**Code samples**

Include the necessary imports, use realistic and working examples, add comments for complex logic, keep each example focused on one concept, and use TypeScript types:

```tsx
import { StrokeButton } from '@skillsoft/gamut';

export const SimpleButtonExample: React.FC = () => (
  <StrokeButton variant="primary">Click me</StrokeButton>
);
```

**Command-line syntax**

Use shell (`sh`) syntax highlighting, skip the prompt symbol (`$`), and put one command per block unless several are directly related:

```bash
yarn add @skillsoft/gamut
```

**File paths**

Use backticks for file paths (`packages/gamut/src/Button/index.tsx`); use a relative path when the context already makes it clear (`./types.ts`), and a workspace-root path when it doesn't. Say "in the `ComponentName.mdx` file" for a code location, rather than a bare path.

**UI element references**

- Bold a UI label: **Next**, **Back**, **Close**.
- Describe where an element is: "Click the **Theme Switcher** (paintbrush icon)."
- Use sentence case: "the **Show code** button."
- Prefer device-agnostic language — "click," not a touch- or mouse-specific verb.
- Avoid directional language like "the form on the right" or "the section above" — say "the following form" or "the previous section" instead.
