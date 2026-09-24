import { forwardRef } from 'react';

import type { ButtonBaseElements } from '../ButtonBase/ButtonBase';
import type { InlineIconButtonProps } from './shared';
import {
  createButtonComponent,
  InlineIconButton,
  sizeVariants,
  textButtonVariants,
} from './shared';

const TextButtonBase = createButtonComponent(textButtonVariants, sizeVariants);

export type TextButtonProps = InlineIconButtonProps<typeof TextButtonBase>;

export const TextButton = forwardRef<ButtonBaseElements, TextButtonProps>(
  ({ ...props }, ref) => {
    return <InlineIconButton button={TextButtonBase} {...props} ref={ref} />;
  }
);
