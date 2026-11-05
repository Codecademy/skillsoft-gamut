import { theme } from '@skillsoft/gamut-styles';

interface Variables {
  [key: string]: string;
}

/**
 * Variables for the Vidstack Player
 * list of variables can be found here:
 * https://vidstack.io/docs/player/components/layouts/default-layout/?styling=default-theme#css-variables
 */
/*
 * The player's chrome sits on video, so it's dark in every mode: the brand
 * and control colors are the mode-independent `white`. Its tooltips and menus
 * follow design's floating-surface rule (`surface-raised`, `border-default`),
 * and the checkbox track follows Toggle's.
 */
export const vdsVariables: Variables = {
  // Video Variables
  '--video-font-family': theme.fontFamily.base,
  '--video-brand': theme.colors.white,
  '--video-controls-color': theme.colors.white,
  '--video-focus-ring-color': theme.colors['action-primary'],
  '--video-bg': theme.colors.black,
  '--video-border-radius': theme.borderRadii.md,
  // Media/Control Variables
  '--media-button-border-radius': theme.borderRadii.md,
  '--media-button-padding': `0px ${theme.spacing[8]}`,
  '--media-tooltip-bg-color': theme.colors['surface-raised'],
  '--media-tooltip-border-radius': theme.borderRadii.sm,
  '--media-tooltip-border': `1px solid ${theme.colors['border-default']}`,
  '--media-tooltip-color': theme.colors['text-default'],
  '--media-tooltip-font-size': theme.fontSize[14],
  '--media-tooltip-padding': theme.spacing[4],
  '--media-menu-checkbox-bg-active': theme.colors['action-primary'],
  '--media-menu-checkbox-bg': theme.colors['border-default'],
  '--media-menu-checkbox-width': '36px',
  '--media-menu-checkbox-height': '18px',
  '--media-menu-checkbox-handle-border': `1px solid ${theme.colors['surface-raised']}`,
  '--media-slider-preview-border-radius': theme.borderRadii.sm,
  '--media-slider-value-bg': theme.colors['surface-raised'],
  '--media-slider-value-border-radius': theme.borderRadii.sm,
  '--media-slider-value-border': `1px solid ${theme.colors['border-default']}`,
  '--media-slider-value-color': theme.colors['text-default'],
  '--media-slider-value-padding': theme.spacing[4],
  '--media-tooltip-exit-animation': 'vds-tooltip-exit 0s',
  '--media-tooltip-enter-animation': 'vds-tooltip-enter 0s',
  '--media-menu-bg': theme.colors['surface-raised'],
  '--media-menu-top-bar-bg': theme.colors['surface-raised'],
  '--media-menu-section-bg': theme.colors['state-selected'],
  '--media-menu-border': `1px solid ${theme.colors['border-default']}`,
  '--media-menu-border-radius': theme.borderRadii.sm,
};
