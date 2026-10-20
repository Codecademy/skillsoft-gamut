import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { ColEl } from '../elements';
import { useListContext } from '../ListProvider';
import type { PublicListProps } from '../types';

export interface ListColProps
  extends PublicListProps<ComponentProps<typeof ColEl>> {}

export const ListCol = forwardRef<HTMLDivElement, ListColProps>(
  ({ type, ...rest }, ref) => {
    const { scrollable, ...activeVariants } = useListContext();
    const sticky = type === 'header' && scrollable;

    return (
      <ColEl
        {...activeVariants}
        {...rest}
        ref={ref}
        sticky={sticky}
        type={type}
      />
    );
  }
);
