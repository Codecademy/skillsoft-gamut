import styled from '@emotion/styled';
import { theme, variant } from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';

import { FlexBox } from '../../Box';
import {
  formFieldFocusStyles,
  formFieldStyles,
  inputSizeStyles,
} from '../../Form/styles';

const errorRing = `inset 0 0 0 1px ${theme.colors['text-error']}`;

/* Error is a 2px `text-error` outline at rest, like `Input`. */
const shellFocusStyles = variant({
  variants: {
    error: {
      borderColor: 'text-error',
      boxShadow: errorRing,
      '&:hover': {
        borderColor: 'text-error',
      },
      '&:focus': {
        borderColor: 'text-error',
        boxShadow: errorRing,
      },
      '&:focus-within': {
        borderColor: 'text-error',
        boxShadow: errorRing,
      },
    },
    default: {
      '&:focus-within': formFieldFocusStyles,
    },
  },
});

interface SegmentedShellProps
  extends StyleProps<typeof inputSizeStyles>,
    StyleProps<typeof shellFocusStyles> {}

/**
 * Shell uses the same styles as `Input`. `formFieldStyles` targets `&:focus`, but the host is a
 * `div` — focus is on inner spinbuttons, so we mirror `Input` focus visuals with `&:focus-within`.
 * For the same reason `:disabled` never matches: a disabled shell sets `aria-disabled`, which
 * `formFieldStyles`' disabled rule also matches.
 */
export const SegmentedShell = styled(FlexBox)<SegmentedShellProps>(
  formFieldStyles,
  inputSizeStyles,
  shellFocusStyles
);
