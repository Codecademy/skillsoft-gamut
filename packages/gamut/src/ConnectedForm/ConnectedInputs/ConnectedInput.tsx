import type * as React from 'react';

import { Input } from '../../Form';
import { useField } from '../utils';
import type { ConnectedInputProps } from './types';

export const ConnectedInput: React.FC<ConnectedInputProps> = ({
  disabled,
  name,
  customValidations,
  ...rest
}) => {
  const { error, isDisabled, ref, isRequired } = useField({
    name,
    disabled,
    customValidations,
  });

  return (
    <Input
      aria-required={isRequired}
      disabled={isDisabled}
      error={Boolean(error)}
      {...ref}
      {...rest}
    />
  );
};
