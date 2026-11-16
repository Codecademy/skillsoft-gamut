import {
  beakBottomStyles,
  beakLeftCenterStyles,
  beakRightCenterStyles,
  beakStylesBase,
  beakTopStyles,
  getBeakBgAndRotation,
  horizontalCenterBeakRtlPopover,
  tooltipBgColor,
} from '../../Tips/shared/styles/styles';
import type { PopoverProps } from '../types';
import { popoverPrimaryBgColor } from './base';

const rtlBeakBoxRight = horizontalCenterBeakRtlPopover('right');
const rtlBeakBoxLeft = horizontalCenterBeakRtlPopover('left');

const positionAbove = {
  top: 'calc(100% - 10px)',
  ...beakStylesBase,
  ...getBeakBgAndRotation({ alignment: 'above', color: popoverPrimaryBgColor }),
} as const;

const positionBelow = {
  top: '-10px',
  ...beakStylesBase,
  ...getBeakBgAndRotation({ alignment: 'below', color: popoverPrimaryBgColor }),
} as const;

const beakRight = {
  right: '25px',
};

const beakLeft = {
  left: '25px',
};

const beakXCenter = {
  left: 'calc(50% - 10px)',
};

const beakYCenter = {
  top: 'calc(50% - 10px)',
};

const positionAboveSml = {
  top: 'calc(100% - 8px)',
  ...beakTopStyles,
} as const;

const positionBelowSml = {
  top: '-8px',
  ...beakBottomStyles,
} as const;

const beakRightSml = {
  right: '1.5rem',
  bg: tooltipBgColor,
};

const beakLeftSml = {
  left: '1.5rem',
  bg: tooltipBgColor,
};

const beakXCenterSml = {
  left: 'calc(50% - 8px)',
};

const beakYCenterSml = {
  top: 'calc(50% - 8px)',
};

const beakRightCenterStylesSml = {
  ...beakRightCenterStyles,
  ...rtlBeakBoxRight,
  left: -8,
};
export const beakRightCenterStylesLrg = {
  ...beakStylesBase,
  ...getBeakBgAndRotation({ alignment: 'right', color: popoverPrimaryBgColor }),
  ...rtlBeakBoxRight,
  left: -10,
};

const beakLeftCenterStylesSml = {
  ...beakLeftCenterStyles,
  ...rtlBeakBoxLeft,
  right: -8,
};
const beakLeftCenterStylesLrg = {
  ...beakStylesBase,
  ...getBeakBgAndRotation({ alignment: 'left', color: popoverPrimaryBgColor }),
  ...rtlBeakBoxLeft,
  right: -10,
};

export const beakBoxX = {
  alignItems: 'flex-end',
  height: '15px',
  width: '100%',
  justifyContent: 'center',
  left: 0,
};

export const beakBoxY = {
  height: '100%',
  width: '15px',
};

export const beakVariantsArray = [
  'below-start',
  'below-end',
  'below-center',
  'above-start',
  'above-end',
  'above-center',
  'below-start-sml',
  'below-end-sml',
  'below-center-sml',
  'above-start-sml',
  'above-end-sml',
  'above-center-sml',
  'center-end',
  'center-start',
  'center-start-sml',
  'center-end-sml',
];

export const getBeakVariant = ({
  align,
  position,
  beak,
  variant,
}: Pick<PopoverProps, 'align' | 'position' | 'beak' | 'variant'>) => {
  const suffix = variant === 'secondary' ? '-sml' : '';
  let beakAlignment: 'start' | 'end' | 'center';

  if (position === 'center') {
    beakAlignment = align ?? 'start';
  } else if (beak === 'center') {
    beakAlignment = 'center';
  } else if (beak === 'start' || beak === 'end') {
    beakAlignment = beak;
  } else {
    beakAlignment = align === 'start' ? 'start' : 'end';
  }

  return `${position}-${beakAlignment}${suffix}`;
};

export const createBeakVariantFromAlignment = (alignment: string) => {
  let styleObject = {};
  const isSml = alignment.includes('sml');
  const isAbove = alignment.includes('above');
  const isBelow = alignment.includes('below');
  const isEnd = alignment.includes('-end');
  const isXCentered = alignment.includes('-center');
  const isYCentered = alignment.startsWith('center-');

  if (isSml) {
    if (isYCentered) {
      // center-x-sml
      styleObject = { ...beakYCenterSml };
      if (isEnd) {
        // center-end-sml
        styleObject = {
          ...styleObject,
          ...beakRightCenterStylesSml,
        };
      } else {
        // center-start-sml
        styleObject = {
          ...styleObject,
          ...beakLeftCenterStylesSml,
        };
      }
    } else {
      if (isAbove) {
        // above-x-sml
        styleObject = { ...positionAboveSml };
      } else {
        // below-x-sml
        styleObject = { ...positionBelowSml };
      }
      if (isEnd) {
        // above-end-sml + below-end-sml
        styleObject = { ...styleObject, ...beakRightSml };
      } else if (isXCentered) {
        // above-center-sml + below-center-sml
        styleObject = { ...styleObject, ...beakXCenterSml };
        if (isAbove) {
          // above-center-sml
          styleObject = { ...styleObject, ...beakTopStyles };
        } else if (isBelow) {
          // below-center-sml
          styleObject = { ...styleObject, ...beakBottomStyles };
        }
      } else {
        // above-start-sml + below-start-sml
        styleObject = { ...styleObject, ...beakLeftSml };
      }
    }
  } else if (isYCentered) {
    // center-x
    styleObject = { ...beakYCenter };
    if (isEnd) {
      // center-end
      styleObject = { ...styleObject, ...beakRightCenterStylesLrg };
    } else {
      // center-start
      styleObject = { ...styleObject, ...beakLeftCenterStylesLrg };
    }
  } else {
    if (isAbove) {
      // above-x
      styleObject = { ...positionAbove };
    } else {
      // below-x
      styleObject = { ...positionBelow };
    }
    if (isEnd) {
      // above-end + below-end
      styleObject = { ...styleObject, ...beakRight };
    } else if (isXCentered) {
      // above-center + below-center
      styleObject = { ...styleObject, ...beakXCenter };
    } else {
      // above-start + below-start
      styleObject = { ...styleObject, ...beakLeft };
    }
  }

  return { ...styleObject };
};
