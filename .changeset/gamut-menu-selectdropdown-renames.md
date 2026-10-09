---
'@skillsoft/gamut': minor
---

**Breaking:** export Menu's list elements and SelectDropdown's option component from the package root, under new names that don't collide with the public `List` component and `IconOption` type.

| Old (`dist/Menu/elements`, `dist/Form/SelectDropdown/elements`) | New (`@skillsoft/gamut`)            |
| --------------------------------------------------------------- | ----------------------------------- |
| `List`, `ListProps`                                             | `MenuList`, `MenuListProps`         |
| `ListItem`, `ListItemProps`                                     | `MenuListItem`, `MenuListItemProps` |
| `ListLink`, `ListLinkProps`                                     | `MenuListLink`, `MenuListLinkProps` |
| `ListButton`                                                    | `MenuListButton`                    |
| `IconOption` (the component)                                    | `IconOptionComponent`               |

`MenuToolTipWrapper` is now exported from the root too. The `IconOption` type is unchanged. Coming from `@codecademy/gamut`, `npx @skillsoft/gamut-codemods scope-swap .` rewrites these imports for you.
