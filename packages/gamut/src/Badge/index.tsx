import styled from '@emotion/styled';
import type { Colors } from '@skillsoft/gamut-styles';
import { styledOptions, system, variant } from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';
import { variance } from '@skillsoft/variance';

import { appendIconToContent } from '../helpers';
import type { IconComponentType, WithChildrenProp } from '../utils';
import { determineIconSize, determineIconSpacing } from './helpers';

const colorVariants = variant({
  defaultVariant: 'primary',
  base: {
    alignItems: 'center',
    borderRadius: 'xl',
    fontFamily: 'accent',
    fontWeight: 400,
    display: 'flex',
    justifyContent: 'center',
    px: 8,
    width: 'min-content',
    whiteSpace: 'nowrap',
  },
  variants: {
    primary: {
      bg: 'text-default',
      textColor: 'text-inverse',
    },
    /*
     * Design gives accent the two-color brand gradient. Its circles are sized
     * in `cqw`, and a badge sizes to its content, so it can't be its own query
     * container. Until the gradient has a fixed-size form, accent is the flat
     * `surface-brand` fallback with the `border-default` edge design adds.
     */
    accent: {
      bg: 'surface-brand',
      border: 1,
      borderColor: 'border-default',
      textColor: 'text-default',
    },
    secondary: {
      bg: 'text-subtle',
      textColor: 'text-inverse',
    },
    tertiary: {
      bg: 'transparent',
      border: 1,
      borderColor: 'border-default',
      textColor: 'text-subtle',
    },
    tertiaryFill: {
      bg: 'surface-raised',
      border: 1,
      borderColor: 'border-default',
      textColor: 'text-subtle',
    },
    custom: {
      textColor: 'text-default',
    },
  },
});

const sizeVariants = variant({
  prop: 'size',
  variants: {
    base: {
      height: '1.5rem',
      fontSize: 14,
      lineHeight: 0,
    },
    sm: {
      height: `1rem`,
      // The powers that be told us this was okay. Please don't do this. Seriously. - <3 Web-Plat
      fontSize: 10 as any,
    },
  },
});

const badgeProps = variance.compose(
  system.space,
  system.layout,
  system.typography,
  system.background,
  system.color
);

type StandardBadgeProps = {
  background?: never;
  bg?: never;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'tertiaryFill' | 'accent';
};

type CustomBadgeBackgroundProps = {
  background: string;
  bg?: never;
  variant: 'custom';
};

type CustomBadgeBgProps = {
  background?: never;
  bg: Colors;
  variant: 'custom';
};

type BadgeBgPropsType =
  | StandardBadgeProps
  | CustomBadgeBackgroundProps
  | CustomBadgeBgProps;

export type BadgeBaseProps = StyleProps<typeof badgeProps> &
  StyleProps<typeof colorVariants> &
  StyleProps<typeof sizeVariants> &
  BadgeBgPropsType &
  WithChildrenProp;

const BadgeBase = styled('div', styledOptions)<BadgeBaseProps>(
  badgeProps,
  colorVariants,
  sizeVariants
);

export type BadgeProps = Partial<IconComponentType> & BadgeBaseProps;

export const Badge: React.FC<BadgeProps> = ({ icon, children, ...rest }) => {
  const size = rest.size === 'sm' ? 'sm' : 'base';
  const iconSize = determineIconSize(size);
  const spacing = determineIconSpacing(size);

  const content = appendIconToContent({
    children,
    icon,
    iconAndTextGap: spacing,
    iconPosition: 'left',
    iconSize,
  });
  return <BadgeBase {...rest}>{content}</BadgeBase>;
};
