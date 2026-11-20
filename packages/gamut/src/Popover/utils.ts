import type { PopoverProps } from './types';

/**
 * Resolves a logical `start` / `end` side to a physical `left` / `right` side
 * (Popover `align` resolution). `start` is `left` unless `useLogicalProperties` is
 * enabled and the element is RTL. `Popover` passes `isRtl` from
 * `useElementDir(targetRef)` and document `dir` (see `Popover` implementation).
 * @param side - The logical horizontal side to resolve.
 * @param isRtl - Whether the element is in an RTL context.
 * @param useLogicalProperties - Whether logical properties are enabled.
 * @returns The resolved physical horizontal side.
 * WARNING : Do not use this function to swap elements that use css logical properties. They will get double-mirrored.
 */
export const resolveHorizontalSideForRtl = ({
  side,
  isRtl,
  useLogicalProperties,
}: {
  side: 'start' | 'end';
  isRtl: boolean;
  useLogicalProperties: boolean | undefined;
}): 'left' | 'right' => {
  const mirrored = Boolean(useLogicalProperties) && isRtl;
  if (side === 'start') return mirrored ? 'right' : 'left';
  return mirrored ? 'left' : 'right';
};

const offsets = {
  primary: 20,
  secondary: 15,
};

export const getDefaultOffset = ({
  axis,
  position,
  variant = 'primary',
}: Pick<PopoverProps, 'position' | 'variant'> & {
  axis: 'horizontal' | 'vertical';
}) => {
  let newPosition = 0;
  if (position === 'center' && axis === 'horizontal' && variant) {
    newPosition = offsets[variant];
  } else if (position !== 'center' && axis === 'vertical' && variant) {
    newPosition = offsets[variant];
  }
  return newPosition;
};
