import styled from '@emotion/styled';

import type { TabElementStyleProps } from './props';
import { tabElementBaseProps } from './props';

export interface TabPanelsProps extends TabElementStyleProps {}

export const TabPanels = styled('div')<TabPanelsProps>(tabElementBaseProps);
