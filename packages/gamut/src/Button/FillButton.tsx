import { forwardRef } from 'react';

import type { ButtonBaseElements } from '../ButtonBase/ButtonBase';
import type {
  InlineIconButtonProps} from './shared';
import {
  createButtonComponent,
  fillButtonVariants,
  InlineIconButton,
  sizeVariants,
} from './shared';

const FillButtonBase = createButtonComponent(sizeVariants, fillButtonVariants);

export type FillButtonProps = InlineIconButtonProps<typeof FillButtonBase>;

export const FillButton = forwardRef<ButtonBaseElements, FillButtonProps>(
  ({ ...props }, ref) => {
    return <InlineIconButton button={FillButtonBase} {...props} ref={ref} />;
  }
);
