# Gamut RFCs

An RFC proposes a substantial change to Gamut, such as a new component, system, or major architectural change.
This is meant to be a lightweight, highly collaborative process driven by the author of the RFC.

Get started by adding a new doc to this directory and then opening a PR.
Once the PR is posted, we can iteratively gather feedback and make edits until rough consensus is reached.
Clarity of vision and agreement on direction is the goal, not perfection.

## Getting started

For new components, copy `0000-component-template.md` to a new file named `000#-component-name.md`, using the next available number.

Fill in all the frontmatter that you can, but don't wait on that to get started.

## Status

Each RFC's frontmatter carries a `status`:

- `draft` — actively taking shape.
- `accepted` — the RFC has gained rough consensus and is ready to be built.
  Set before merging the RFC PR.
- `implemented` — an implementation and final docs page\* both exist.
  Add links to both in `related_documents`.
  From this point on, the RFC is a snapshot and its body won't be updated anymore.
- `superseded` — a later RFC replaces this one's design.
  Add `superseded_by: <link>` pointing to it.

No RFC is final before it's merged.
Expect to revise a `draft` RFC as review surfaces gaps.

\* In most cases, the final docs page is a consumer-facing doc on our website.
It should lift material from the RFC where appropriate, but it won't contain the exact same material since the audience for our docs is consumers, whereas the audience for an RFC is implementers.

## Review

At minimum, one Gamut engineer and one Gamut designer must approve before merging.
Every Gamut engineer is invited to review.
Inviting an engineer or designer from a consuming team is encouraged, especially when the RFC affects them directly, but it is not required.
