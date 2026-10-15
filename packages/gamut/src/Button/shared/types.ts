import type { ColorModes } from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';
import type { ComponentProps, HTMLProps } from 'react';

import type { ButtonBase } from '../../ButtonBase';
import type { IconComponentType } from '../../utils';
import type { CTAButton } from '../CTAButton';
import type { FillButton } from '../FillButton';
import type { IconButton } from '../IconButton';
import type { StrokeButton } from '../StrokeButton';
import type { TextButton } from '../TextButton';
import type { buttonProps, buttonVariants } from './styles';

export interface ButtonBaseProps extends StyleProps<typeof buttonProps> {
  onClick?: HTMLProps<HTMLButtonElement>['onClick'];
  variant?: (typeof buttonVariants)[number];
  size?: 'normal' | 'small' | 'large';
  as?: never;
  mode?: ColorModes;
}

export type ButtonProps = ButtonBaseProps & ComponentProps<typeof ButtonBase>;

export type InlineIconButtonProps<
  BaseButtonType extends
    | keyof React.JSX.IntrinsicElements
    | React.JSXElementConstructor<any>
> = ComponentProps<BaseButtonType> &
  Partial<IconComponentType> & {
    iconPosition?: 'right' | 'left';
  };

/* eslint-disable @typescript-eslint/no-duplicate-type-constituents -- createButtonComponent yields structurally identical typeofs; union documents distinct components */
export type ButtonTypes =
  | typeof CTAButton
  | typeof FillButton
  | typeof IconButton
  | typeof StrokeButton
  | typeof TextButton;
/* eslint-enable @typescript-eslint/no-duplicate-type-constituents */
