import type { Theme } from '@emotion/react';
import { useTheme } from '@emotion/react';

/*
 * The theme's raised shadow, for floating surfaces (menus, popovers, tips,
 * toasts, the SelectDropdown menu). Design's map gives them a `border-subtle`
 * hairline and lets the shadow separate them from what's underneath.
 * Design hasn't defined an overlay depth yet, so they use the raised depth
 * for now.
 */
export const raisedShadow = ({ theme }: { theme: Theme }) => ({
  boxShadow: theme?.elevation?.['rest-shadow'],
});

/*
 * The checker pattern behind Modal, Toast, PreviewTip and the DatePicker
 * calendar is Original Codecademy's alone (design's map), drawn in
 * `border-subtle`. Skillsoft and the other brands separate those surfaces
 * with their edge and shadow instead (design's elevation proposal). Themes
 * from before the color system keep the pattern.
 */
export const useCheckerPattern = (): boolean => {
  const { brand } = useTheme() as { brand?: string };
  return brand === undefined || brand === 'originalCodecademy';
};

export const checkerPatternColor = 'border-subtle' as const;
