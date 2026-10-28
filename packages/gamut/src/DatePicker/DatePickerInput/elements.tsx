import styled from '@emotion/styled';
import { variant } from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';

import { FlexBox } from '../../Box';
import {
  formFieldFocusStyles,
  formFieldStyles,
  inputSizeStyles,
} from '../../Form/styles';

const shellFocusStyles = variant({
  variants: {
    error: {
      borderColor: 'text-error',
      '&:hover': {
        borderColor: 'text-error',
      },
      '&:focus': {
        borderColor: 'text-error',
        boxShadow: `inset 0 0 0 1px feedback-error`,
      },
      '&:focus-within': {
        borderColor: 'text-error',
        boxShadow: `inset 0 0 0 1px feedback-error`,
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
 */
export const SegmentedShell = styled(FlexBox)<SegmentedShellProps>(
  formFieldStyles,
  inputSizeStyles,
  shellFocusStyles
);
