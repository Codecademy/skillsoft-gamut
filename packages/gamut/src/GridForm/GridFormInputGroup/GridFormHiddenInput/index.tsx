import type * as React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Input } from '../../../Form';
import type { GridFormHiddenField } from '../../types';

export type GridFormHiddenInputProps = {
  field: GridFormHiddenField;
  register: UseFormReturn['register'];
};

export const GridFormHiddenInput: React.FC<GridFormHiddenInputProps> = ({
  field,
  register,
}) => {
  return <Input {...register(field.name)} type={field.type} />;
};
