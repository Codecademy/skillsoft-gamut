import styled from '@emotion/styled';
import { pxRem } from '@skillsoft/gamut-styles';
import type { HTMLAttributes } from 'react';
import type * as React from 'react';

const TableWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors['border-subtle']};
  max-height: 500px;
  overflow: auto;
  margin-bottom: 1rem;

  table {
    font-family: ${({ theme }) => theme.fontFamily.monospace};
    padding: ${pxRem(10)};
    width: 100%;
    color: ${({ theme }) => theme.colors['text-default']};
    position: relative;

    thead {
      position: relative;
    }

    tr {
      height: ${pxRem(30)};
      font-size: ${pxRem(13)};
    }

    tr:nth-of-type(odd) {
      background-color: ${({ theme }) => theme.colors['surface-sunken']};
    }

    td,
    th {
      padding-left: 0.5rem;
      text-align: inherit;
      vertical-align: middle;
      color: ${({ theme }) => theme.colors.black};
    }

    tr:nth-of-type(even),
    th {
      background-color: ${({ theme }) => theme.colors.white};
    }
  }
`;

export const Table: React.FC<HTMLAttributes<HTMLTableElement>> = (props) => {
  return (
    <TableWrapper>
      <table {...props} />
    </TableWrapper>
  );
};
