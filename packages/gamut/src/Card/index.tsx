import { CheckerDense } from '@skillsoft/gamut-patterns';
import type { Colors } from '@skillsoft/gamut-styles';
import { borderRadii, useColorModes } from '@skillsoft/gamut-styles';
import type * as React from 'react';

import { DynamicCardWrapper, MotionBox, StaticCardWrapper } from './elements';
import { cardSurfaces, patternFadeInOut, useCardElevation } from './styles';
import type { CardProps } from './types';

type BorderRadiusToken = keyof typeof borderRadii;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  shadow = 'none',
  isInteractive = false,
  pattern: Pattern = CheckerDense,
  borderRadius,
  width = '100%',
  height = '100%',
  ...rest
}) => {
  const defaultBorderRadius: BorderRadiusToken = isInteractive ? 'md' : 'none';
  const trueBorderRadius = borderRadius ?? defaultBorderRadius;
  const resolvedBorderRadius =
    borderRadii[trueBorderRadius as BorderRadiusToken];

  const SelectedWrapper =
    variant === 'default' ? DynamicCardWrapper : StaticCardWrapper;

  const hasPattern = shadow === 'patternLeft' || shadow === 'patternRight';
  const isOutline = shadow === 'outline';

  const setHoverShadow = useCardElevation(shadow, resolvedBorderRadius);
  const [, , modes] = useColorModes();

  /*
   * Background picks the content mode from the color it's given. Navy is a
   * dark-mode scope, so it gets dark mode's `surface-raised` palette color.
   */
  const surface =
    variant === 'navy'
      ? (modes.dark['surface-raised'] as Colors)
      : cardSurfaces[variant as keyof typeof cardSurfaces];
  const gradient =
    surface === 'surface-brand' ? 'var(--gradient-surface-brand)' : undefined;

  const initialVariant = isOutline ? 'initialOutline' : 'initial';
  const animateVariant = isOutline ? 'animateOutline' : 'animate';

  return (
    <MotionBox
      animate={initialVariant}
      height={height}
      initial={initialVariant}
      position="relative"
      whileHover={isInteractive ? animateVariant : ''}
      width={width}
    >
      {hasPattern && (
        <MotionBox
          borderRadius={trueBorderRadius}
          color="text-default"
          variants={patternFadeInOut}
        >
          <Pattern
            dimensions={1}
            left={shadow === 'patternLeft' ? '-0.5rem' : undefined}
            position="absolute"
            right={shadow === 'patternRight' ? '-0.5rem' : undefined}
            // eslint-disable-next-line @skillsoft/gamut/no-inline-style
            style={{ borderRadius: 'inherit', color: 'currentcolor' }}
            top=".5rem"
          />
        </MotionBox>
      )}
      <SelectedWrapper
        // setting bg here since Background requires a bg prop
        // the falsy value of '' will not get set since the variant's bg would override it
        bg={variant !== 'default' ? surface : ('' as Colors)}
        border={1}
        borderRadius={trueBorderRadius}
        dimensions={1}
        gradient={gradient}
        isInteractive={isInteractive}
        maxWidth="100%"
        p={16}
        position="relative"
        shadow={shadow}
        variant={variant}
        variants={setHoverShadow}
        {...rest}
      >
        {children}
      </SelectedWrapper>
    </MotionBox>
  );
};
