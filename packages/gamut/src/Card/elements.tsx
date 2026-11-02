import styled from '@emotion/styled';
import { Background } from '@skillsoft/gamut-styles';
import type { MotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import type { ComponentProps, ComponentType } from 'react';

import { Box } from '../Box';
import { cardVariants, shadowVariants } from './styles';
import type { CardWrapperProps } from './types';

/*
 * framer-motion types `motion.create(Box)` with a mapped type that drops where
 * each of Box's props was declared, so docgen can't filter out its DOM
 * attributes and Card's props table lists all of them. `Omit` keeps them.
 */
type MotionBoxProps = Omit<ComponentProps<typeof Box>, keyof MotionProps> &
  MotionProps;

export const MotionBox = motion.create(Box) as ComponentType<MotionBoxProps>;

export const DynamicCardWrapper = styled(MotionBox)<CardWrapperProps>(
  cardVariants,
  shadowVariants
);

const StaticCard = motion.create(Background);
export const StaticCardWrapper = styled(StaticCard)<CardWrapperProps>(
  cardVariants,
  shadowVariants
);
