import type { ColorModes } from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';
import type { ComponentProps, HTMLProps } from 'react';

import type { ButtonBase } from '../../ButtonBase';
import type { IconComponentType } from '../../utils';
import type { buttonProps, buttonVariants } from './styles';

export interface ButtonBaseProps extends StyleProps<typeof buttonProps> {
  onClick?: HTMLProps<HTMLButtonElement>['onClick'];
  /** If defined, component will use an anchor tag */
  href?: HTMLProps<HTMLAnchorElement>['href'];
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
