import styled from '@emotion/styled';
import { css, styledOptions } from '@skillsoft/gamut-styles';
import { motion } from 'framer-motion';

import { FlexBox } from '../../Box';
import { Text } from '../../Typography';
import { barListItemPadding } from '../shared/styles';

export const TotalValueLabelsHoverTarget = styled(FlexBox)(
  css({
    alignItems: 'center',
    flexShrink: 0,
    height: 'stretch',
    justifyContent: 'flex-end',
  })
);

// `target` is normally stamped automatically by `@emotion/babel-plugin`, which
// only runs the source through Babel — not through the tsdown/rolldown build.
// It's what makes the `${CategoryLabel}` component-selector interpolation below
// work; without it, `@emotion/styled` falls back to `.undefined` in production.
// Pass it explicitly here since this is the only component-selector site in the
// package — a lint rule flags any future `${Component}` style interpolation
// that doesn't have an explicit `target`.
export const CategoryLabel = styled(Text, { target: 'gmt-category-label' })(
  css({
    fontWeight: 'bold',

    whiteSpace: 'nowrap',
  })
);

const rowBaseStyles = css({
  alignItems: 'center',
  bg: 'transparent',
  border: 'none',
  cursor: 'inherit',
  display: 'flex',
  flexDirection: { _: 'column', c_xs: 'row' },
  p: barListItemPadding,
  position: 'relative',
  textDecoration: 'none',
  width: '100%',
  '&:focus': {
    outline: 'none',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '2px',
  },
});

const interactiveStyles = css({
  cursor: 'pointer',
  '&:hover, &:focus-visible': {
    bg: 'background-hover',
    textDecoration: 'none',
  },
});

export const RowWrapper = styled('span')(rowBaseStyles);
export const RowButton = styled('button', styledOptions<'button'>())(
  rowBaseStyles,
  interactiveStyles
);
export const RowAnchor = styled('a', styledOptions<'a'>())(
  rowBaseStyles,
  interactiveStyles,
  css({
    [`&:focus-visible ${CategoryLabel}, &:hover ${CategoryLabel}`]: {
      textDecoration: 'underline',
      textDecorationColor: 'primary',
    },
  })
);

export const BarWrapper = styled(FlexBox)(
  css({
    alignItems: 'center',
    borderRadius: { _: 'md' as any, c_xs: 'xl' },
    flex: { _: 'none', c_xs: 1 },
    height: { _: 8, c_xs: 24 },
    overflow: 'hidden',
    position: 'relative',
    width: { _: '100%', c_xs: 'auto' },
    mt: { _: 8, c_xs: 0 },
  })
);

export const Bar = styled(motion.create(FlexBox))(
  css({
    alignItems: 'center',
    borderRadius: 'inherit',
    borderStyle: 'solid',
    borderWidth: '1px',
    height: '100%',
    left: 0,
    position: 'absolute',
  })
);
