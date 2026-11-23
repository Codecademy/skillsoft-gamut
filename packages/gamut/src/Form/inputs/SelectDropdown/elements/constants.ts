import {
  ArrowChevronDownIcon,
  CloseIcon,
  MiniChevronDownIcon,
  MiniDeleteIcon,
} from '@skillsoft/gamut-icons';

export const iconSize = { sm: 12, md: 16 };
export const selectedIconSize = { sm: 16, md: 24 };

export const indicatorIcons = {
  smChevron: {
    size: iconSize.sm,
    icon: MiniChevronDownIcon,
  },
  mdChevron: {
    size: iconSize.md,
    icon: ArrowChevronDownIcon,
  },
  smRemove: {
    size: iconSize.sm,
    icon: MiniDeleteIcon,
  },
  mdRemove: {
    size: iconSize.md,
    icon: CloseIcon,
  },
};
