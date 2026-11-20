import { CheckerDense } from '@skillsoft/gamut-patterns';

import type {
  PopoverProps,
  PopoverXPositionType,
  PopoverYPositionType,
} from '../../Popover';
import type { TipPlacementComponentProps, TipWrapperProps } from './types';

export const getAlignmentStyles = ({
  alignment,
  avatar,
  type,
}: Pick<TipWrapperProps, 'alignment' | 'avatar' | 'type'>) => {
  if (avatar) return 'avatarAligned';
  if (type === 'preview') return 'previewAligned';
  if (alignment.startsWith('start') || alignment.startsWith('end'))
    return 'horizontalCenter';
  return alignment.includes('center') ? 'vertCenter' : 'aligned';
};

export const getPopoverAlignmentAndPattern = ({
  alignment = 'top-start',
  type,
}: Partial<Pick<TipPlacementComponentProps, 'alignment' | 'type'>>):
  | (PopoverXPositionType & Pick<PopoverProps, 'align'>)
  | (PopoverYPositionType & Pick<PopoverProps, 'align'>) => {
  const popoverAlignment: PopoverYPositionType & Pick<PopoverProps, 'align'> = {
    align: 'end',
    beak: 'end',
    position: 'above',
    pattern: undefined,
  };

  if (type === 'tool') {
    popoverAlignment.align = 'center';
  }

  if (type === 'preview') {
    popoverAlignment.pattern = CheckerDense;
  }

  if (alignment.includes('center')) {
    popoverAlignment.beak = 'center';
  }

  if (alignment.startsWith('start-') || alignment.startsWith('end-')) {
    if (alignment.startsWith('start-')) {
      popoverAlignment.align = 'start';
    } else {
      popoverAlignment.align = 'end';
    }
    return {
      beak: 'center',
      position: 'center',
      align: popoverAlignment.align,
    };
  }

  if (alignment.includes('bottom')) popoverAlignment.position = 'below';

  if (alignment.endsWith('-end')) {
    popoverAlignment.align = 'start';
    popoverAlignment.beak = 'start';
  }

  return popoverAlignment;
};
