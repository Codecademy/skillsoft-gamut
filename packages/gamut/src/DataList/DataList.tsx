import type { ReactElement } from 'react';

import type { DataGridProps } from './DataGrid';
import { DataGrid } from './DataGrid';
import type { ColumnConfig, IdentifiableKeys } from './types';

export interface DataList {
  <Row, IdKey extends IdentifiableKeys<Row>, Cols extends ColumnConfig<Row>[]>(
    props: Omit<DataGridProps<Row, IdKey, Cols>, 'variant'> & {
      variant?: 'default' | 'card';
    }
  ): ReactElement<any, any>;
}

export const DataList: DataList = ({ variant = 'default', ...rest }) => {
  return (
    <DataGrid variant={variant} {...rest} scrollable={false} shadow={false} />
  );
};
