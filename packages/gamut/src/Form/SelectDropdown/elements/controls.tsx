import { components as SelectDropdownElements } from 'react-select';

import type { SizedIndicatorProps } from '../types';
import { indicatorIcons } from './constants';

const { DropdownIndicator } = SelectDropdownElements;

/**
 * Custom dropdown indicator that shows either a chevron or search icon.
 * The icon type depends on whether the select is searchable or not.
 */
export const DropdownButton = (props: SizedIndicatorProps) => {
  const { size } = props.selectProps;
  /* The field's chevron is `text-subtle`, disabled or not. */
  const color = 'text-subtle';
  const iconSize = size ?? 'medium';
  const { ...iconProps } = indicatorIcons[`${iconSize}Chevron`];
  const { icon: IndicatorIcon } = iconProps;

  return (
    <DropdownIndicator {...props}>
      <IndicatorIcon {...iconProps} color={color} />
    </DropdownIndicator>
  );
};
