import { system } from '@skillsoft/gamut-styles';
import type { StyleProps} from '@skillsoft/variance';
import { variance } from '@skillsoft/variance';

export enum TabSelectors {
  SELECTED = '&[data-selected]',
  HOVER = '&:hover',
  ACTIVE = '&:active',
  FOCUS = '&:focus',
  DISABLED = "[disabled], &:disabled, &[aria-disabled='true']",
  FOCUS_VISIBLE = ' &:focus-visible',
  BEFORE = '&::before',
}

export interface TabElementStyleProps
  extends StyleProps<typeof tabElementBaseProps> {}

export const tabElementBaseProps = variance.compose(
  system.layout,
  system.positioning,
  system.space
);
