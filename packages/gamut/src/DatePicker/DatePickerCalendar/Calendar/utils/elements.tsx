import styled from '@emotion/styled';
import { css, states, transitionConcat } from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';

export const CalendarTable = styled.table(
  css({
    /** Row gaps only: 0 between columns, 8px token between rows (incl. under header). */
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  })
);

export const TableHeader = styled.th(
  css({
    fontSize: 14,
    fontWeight: 'base',
    /* Like a List header's sort icon: secondary text, not a disabled one. */
    color: 'text-subtle',
    textAlign: 'center',
  })
);

const datecellStates = states({
  isToday: {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 4,
      /** Half of dot width (4px) so the marker sits under the centered date numeral. */
      insetInlineStart: 'calc(50% - 2px)',
      width: 4,
      height: 4,
      borderRadius: 'full',
      /* An indicator, like the Tabs indicator. */
      bg: 'action-primary',
    },
  },
  /* A dark chip, like the selection Tag: `text-inverse` on the fill. */
  isSelected: {
    bg: 'text-default',
    color: 'text-inverse',
    '&:hover, &:focus': {
      bg: 'action-neutral-hover',
      color: 'text-inverse',
    },
    '&::after': {
      bg: 'text-inverse',
    },
  },
  isRangeStart: {
    borderRadiusRight: 'none',
  },
  isRangeEnd: {
    borderRadiusLeft: 'none',
  },
  /* Days inside a range are selected rows: the `state-selected` veil. */
  isInRange: {
    bg: 'state-selected',
    color: 'text-default',
    borderRadius: 'none',
    '&:hover, &:focus': {
      bg: 'action-neutral-hover',
      color: 'text-inverse',
    },
  },
  isDisabled: {
    color: 'action-disabled',
    bg: 'transparent',
    cursor: 'not-allowed',
    userSelect: 'none',
    textDecoration: 'line-through',
    '&:hover, &:focus': {
      color: 'action-disabled',
      bg: 'transparent',
      textDecoration: 'line-through',
      cursor: 'not-allowed',
      userSelect: 'none',
    },
  },
});

type DateCellProps = StyleProps<typeof datecellStates>;

export const DateCell = styled.td<DateCellProps>(
  css({
    fontWeight: 'base',
    width: '32px',
    height: '32px',
    textAlign: 'center',
    padding: 0,
    position: 'relative',
    borderRadius: 'md',
    transition: transitionConcat(
      ['border-color', 'color', 'background-color', 'box-shadow'],
      'fast',
      'ease-in'
    ),
    '&:hover': {
      color: 'action-neutral',
      bg: 'state-hover',
      transition: transitionConcat(
        ['background-color', 'box-shadow'],
        'fast',
        'ease-in'
      ),
      cursor: 'pointer',
    },
    '&:focus-visible': {
      color: 'action-neutral',
      outline: 'none',
    },
    '&:active': {
      color: 'text-default',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: -3,
      borderRadius: 'lg',
      border: 2,
      borderColor: 'action-primary',
      opacity: 0,
      zIndex: 0,
    },
    '&:focus-visible::before': {
      opacity: 1,
    },
  }),
  datecellStates
);
