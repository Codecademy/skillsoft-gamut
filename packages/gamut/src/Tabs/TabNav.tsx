import styled from '@emotion/styled';
import { styledOptions } from '@skillsoft/gamut-styles';
import { StyleProps } from '@skillsoft/variance';

import { tabElementBaseProps, TabElementStyleProps } from './props';
import { tabContainerStates, tabContainerVariants } from './styles';

export interface TabNavProps
  extends StyleProps<typeof tabContainerVariants>,
    StyleProps<typeof tabContainerStates>,
    TabElementStyleProps {}

export const TabNav = styled('nav', styledOptions<'nav'>())<TabNavProps>(
  tabElementBaseProps,
  tabContainerVariants,
  tabContainerStates
);
