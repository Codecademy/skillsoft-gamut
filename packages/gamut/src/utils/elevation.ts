import type { Theme } from '@emotion/react';

/*
 * The theme's raised shadow, for floating surfaces (menus, popovers, tips,
 * toasts, the SelectDropdown menu). Design's map gives them a `border-subtle`
 * hairline and lets the shadow separate them from what's underneath
 * (sandbox df33b47). Design hasn't defined an overlay depth yet, so they use
 * the raised depth for now.
 */
export const raisedShadow = ({ theme }: { theme: Theme }) => ({
  boxShadow: theme?.elevation?.['rest-shadow'],
});
