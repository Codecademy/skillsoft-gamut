import { matchers } from '@emotion/jest';
import { setupRtl } from '@skillsoft/gamut-tests';
import type { RenderResult } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DataGridProps } from './DataGrid';
import { DataGrid } from './DataGrid';
import type { ColumnConfig } from './types';

// Add the custom matchers provided by '@emotion/jest'
expect.extend(matchers);

type Row = { id: string; name: string; sin: string };
type Columns = ColumnConfig<Row>[];

type Props = DataGridProps<Row, 'id', Columns>;

const onRowSelect = vi.fn();
const onRowExpand = vi.fn();
const onQueryChange = vi.fn();

const props = {
  id: 'test',
  idKey: 'id',
  rows: [
    { id: '1', name: 'Hari Seldon', sin: 'Messiah Complex' },
    { id: '2', name: 'Bel Roise', sin: 'Competence' },
    { id: '3', name: 'Cleon II', sin: 'Hubris' },
  ],
  columns: [{ key: 'name' }, { key: 'sin' }],
  onRowSelect,
  onRowExpand,
  onQueryChange,
  expandedContent: ({ row: { id } }) => <div>Expanded {id}</div>,
} as Props;

const renderView = setupRtl(DataGrid, props as any) as <
  T extends Partial<Props>
>(
  props?: T
) => { view: RenderResult };

describe('DataGrid', () => {
  describe('Selecting Rows', () => {
    it('tints a selected row with the state-selected veil', () => {
      renderView({ selected: ['1'] });

      const rows = screen.getAllByRole('row');
      const selectedRow = screen
        .getByRole('checkbox', { name: 'Select 1' })
        .closest('tr')!;
      const otherRow = screen
        .getByRole('checkbox', { name: 'Select 2' })
        .closest('tr')!;

      expect(rows).toContain(selectedRow);
      expect(selectedRow).toHaveStyleRule(
        'background-image',
        expect.stringContaining('var(--color-state-selected)')
      );
      expect(otherRow).not.toHaveStyleRule(
        'background-image',
        expect.stringContaining('var(--color-state-selected)')
      );
    });
  });
});
