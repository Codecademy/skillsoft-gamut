import {
  beforeStylesHorizontal,
  bottomStyles,
  bottomStylesAfter,
  bottomStylesBefore,
  centerHorizontal,
  horizontalCenterStyles,
  leftAlignStyles,
  leftAlignStylesAfter,
  leftVertStyles,
  leftVertStylesAfter,
  rightAlignStyles,
  rightAlignStylesAfter,
  rightVertStyles,
  rightVertStylesAfter,
  topStyles,
  topStylesAfter,
  topStylesBefore,
  verticalCenterStyles,
  verticalCenterStylesAfter,
} from './styles';

export {
  getAlignmentStyles,
  getPopoverAlignmentAndPattern,
} from '../popoverAlignmentUtils';

export const createToolTipVariantFromAlignment = (alignment: string) => {
  let styleObject = {};
  let styleObjectAfter = {};
  let styleObjectBefore = {};

  const isEnd = alignment.startsWith('end') || alignment.endsWith('-end');
  const isTop = alignment.includes('top');
  const isCenter = alignment.includes('center');
  const isBottom = alignment.includes('bottom');
  const isLRAligned =
    alignment.startsWith('end') || alignment.startsWith('start');

  // top-center, top-end, + top-start styles
  if (isTop) {
    styleObject = { ...topStyles };
    styleObjectAfter = { ...topStylesAfter };
    styleObjectBefore = { ...topStylesBefore };
    // bottom-center, bottom-end, + bottom-start styles
  } else if (isBottom) {
    styleObject = { ...bottomStyles };
    styleObjectAfter = { ...bottomStylesAfter };
    styleObjectBefore = { ...bottomStylesBefore };
  } else if (isLRAligned) {
    // end-center & start-center styles
    styleObject = { ...horizontalCenterStyles };
    styleObjectAfter = { ...centerHorizontal };
    styleObjectBefore = { ...beforeStylesHorizontal };
    // end-center styles
    if (isEnd) {
      styleObject = { ...styleObject, ...rightAlignStyles };
      styleObjectAfter = { ...styleObjectAfter, ...rightAlignStylesAfter };
      // start-center styles
    } else {
      styleObject = { ...styleObject, ...leftAlignStyles };
      styleObjectAfter = { ...styleObjectAfter, ...leftAlignStylesAfter };
    }
  }

  // top-center + bottom-center styles
  if (isCenter && !isLRAligned) {
    styleObject = { ...styleObject, ...verticalCenterStyles };
    styleObjectAfter = { ...styleObjectAfter, ...verticalCenterStylesAfter };
  } else if (!isCenter && !isLRAligned) {
    // top-end, bottom-end
    if (isEnd) {
      styleObject = { ...styleObject, ...rightVertStyles };
      styleObjectAfter = { ...styleObjectAfter, ...rightVertStylesAfter };
    } else {
      // top-start, bottom-start
      styleObject = { ...styleObject, ...leftVertStyles };
      styleObjectAfter = { ...styleObjectAfter, ...leftVertStylesAfter };
    }
  }

  return {
    ...styleObject,
    '&::after': styleObjectAfter,
    '&::before': styleObjectBefore,
  };
};
