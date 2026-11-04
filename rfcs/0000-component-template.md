---
status: draft
start_date: # YYYY-MM-DD. add this when you start writing it, not when you first commit or share it
related_documents:
  - https://skillsoftdev.atlassian.net/browse/GMT-####
  - file/in/this/repo.md
pull_request: # link to the PR
---

## Summary

One paragraph explanation of the new component.

If the component contains new sub-components that are part of its content model, also list them here.

```jsx
<Component>
  <SubComponentOne />
  <SubComponentTwo />
</Component>
```

- `<Component>` - a brief description of the component.
- `<SubComponentOne>` - a brief description of the component.
- `<SubComponentTwo>` - a brief description of the component.

## Motivation

An explanation of why the component should be part of the design system.
This should be more detailed than the summary, but doesn't need to be an essay.
Consider:

- What real-world applications need this component?
- What will it help end users accomplish?
- What components already exist in other apps or libraries that this will replace or supersede?
- What benefits do consuming app teams get by using our component instead of building their own?
- Why now?

## Detailed design

This is the bulk of the RFC.
Write as if the component already exists and you're teaching it to another developer.
This should get into specifics and edge cases, and include examples of how the component is used.
Any new terminology should be defined here.

That generally means:

- Introducing any new components and props.
  - Tip: focus on stabilizing the _description_ of the functionality that a prop or component captures rather than its name.
    [Naming is hard](https://www.karlton.org/2017/12/naming-things-hard/), and is often one of the biggest points of conversation during the review, so expect a lot of feedback about names.
- Explaining the component largely in terms of examples of how someone would use it, not its internals, implementation, or technical constraints.
- Explaining how consumers would use the component to compose more complex patterns, and how it should impact the way they think about composition.
- If applicable, providing sample error messages, deprecation warnings, or migration guidance.
- If applicable, describing the differences between teaching this to experienced developers and completely new developers.

Be generous with sub-headings in this section to enumerate each part of your architecture, especially if your component has multiple parts.

### Architecture and API

Each component that exposes a public API should at a minimum cover:

- Interfaces it extends or an explicit note that it extends none.
- New props not already on an extended interface.
- Resulting HTML and ARIA structure.

Use TypeScript code blocks to describe the API and HTML code blocks to describe the architecture via pseudocode.
Aim for clarity, not syntactical correctness (fake syntax can even help clarify that implementation may be different).
Real code comes later.

For example:

```typescript
// type is always "password"
type PasswordFieldPropsBase = Omit<React.ComponentProps<'input'>, 'type'>;

interface PasswordFieldProps extends PasswordFieldPropsBase {
  /** The accessible name for the field. @default "Password" */
  label?: string;
  /** Whether the input is an invalid password. */
  isInvalid?: boolean;
}
```

```html
<label for="pwd-1">{label}</label>
<input type="password" id="pwd-1" aria-invalid="`{isInvalid}`" />
```

> [!TIP]
> Why not React?
> TypeScript types are a great shorthand for the developer experience (the API).
> But our end users don't experience the API—they experience HTML.

### Interaction

Device-agnostic interaction design.
Cover events including (but not limited to) clicking, hovering, and focusing, plus their resulting effects.
Omit this section for purely presentational components.

#### Keyboard

If there's interaction, keyboard design is required.
Check https://www.w3.org/WAI/ARIA/apg/patterns/ for examples of how to format this.
For example: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/#keyboard_interaction.

## Drawbacks

Why should we not do this?
Please consider:

- Implementation cost in terms of size, complexity, and maintenance.
- How it will impact other teams (not just engineering).
- The cost of migrating applications to the proposed solution.

There are tradeoffs to choosing any path.
Please attempt to identify them here.

## Alternatives

What other designs have been considered?
Is there a way for developers to do this without this component?

Please focus on alternative ways to design the component, rather than alternative solutions that exist in other libraries.
There are two reasons you might mention another library:

1. Extending another library is a viable or expected alternative.
   If that's the case, explain why it wasn't pursued.
   Don't just list it as an alternative.
2. Another library uses an idiomatic design that was considered but ultimately not used.
   If that's the case, focus your explanation on why the design wasn't chosen and reference the library, but don't focus on it.

## Adoption strategy

If we implement this proposal, how will existing applications adopt it?
Focus on how applications might use it or migrate to it rather than which applications might use it.

## Unresolved questions

Optional, but suggested for first drafts.
What parts of the design are still TBD?
