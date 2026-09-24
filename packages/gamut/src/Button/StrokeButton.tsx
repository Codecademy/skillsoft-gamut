import { forwardRef } from 'react';

import type { ButtonBaseElements } from '../ButtonBase/ButtonBase';
import type { InlineIconButtonProps } from './shared';
import {
  createButtonComponent,
  InlineIconButton,
  sizeVariants,
  strokeButtonVariants,
} from './shared';

const StrokeButtonBase = createButtonComponent(
  sizeVariants,
  strokeButtonVariants
);

export type StrokeButtonProps = InlineIconButtonProps<typeof StrokeButtonBase>;

export const StrokeButton = forwardRef<ButtonBaseElements, StrokeButtonProps>(
  ({ ...props }, ref) => {
    return <InlineIconButton button={StrokeButtonBase} {...props} ref={ref} />;
  }
);
