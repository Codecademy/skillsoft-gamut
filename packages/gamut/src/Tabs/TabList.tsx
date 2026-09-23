import styled from '@emotion/styled';
import type { StyleProps } from '@skillsoft/variance';
import type * as React from 'react';
import type {
  TabListProps as ReactAriaTabListProps,
  TabProps} from 'react-aria-components';
import {
  TabList as ReactAriaTabList
} from 'react-aria-components';

import type { TabElementStyleProps } from './props';
import { tabElementBaseProps } from './props';
import { tabContainerStates, tabContainerVariants } from './styles';
import { useTab } from './TabProvider';

export interface TabListBaseProps
  extends StyleProps<typeof tabContainerVariants>,
    StyleProps<typeof tabContainerStates>,
    TabElementStyleProps {}

export interface TabListProps
  extends TabListBaseProps,
    ReactAriaTabListProps<TabProps> {}

const TabListBase = styled(ReactAriaTabList)<TabListProps>(
  tabContainerVariants,
  tabContainerStates,
  tabElementBaseProps
);

export const TabList: React.FC<TabListProps> = (props) => {
  const { variant } = useTab();
  return <TabListBase {...props} variant={variant} />;
};
