import type * as React from 'react';

import { FormContext } from '../../__fixtures__/helpers';
import type { GridFormContentProps } from '../GridFormContent';
import { GridFormContent } from '../GridFormContent';
import type { GridFormSectionProps } from '../GridFormSection';
import { GridFormSection } from '../GridFormSection';

type GridFormContentTestComponentProps = GridFormContentProps & {
  mode?: 'onSubmit' | 'onChange';
};

type GridFormSectionTestComponentProps = GridFormSectionProps & {
  mode?: 'onSubmit' | 'onChange';
};

export const GridFormContentTestComponent: React.FC<
  GridFormContentTestComponentProps
> = ({ field, mode = 'onSubmit' }) => {
  return (
    <FormContext mode={mode}>
      <GridFormContent field={field} key={field.name} />
    </FormContext>
  );
};

export const GridFormSectionTestComponent: React.FC<
  GridFormSectionTestComponentProps
> = ({ fields, mode = 'onSubmit' }) => {
  return (
    <FormContext mode={mode}>
      <GridFormSection fields={fields} />
    </FormContext>
  );
};
