import type * as React from 'react';

import { Radio } from '../../Form';
import { useField } from '../utils';
import type { ConnectedRadioProps } from './types';

export const ConnectedRadio: React.FC<ConnectedRadioProps> = ({
  disabled,
  name,
  customValidations,
  ...rest
}) => {
  const { error, isDisabled, ref } = useField({
    name,
    disabled,
    customValidations,
  });

  return (
    <Radio disabled={isDisabled} error={Boolean(error)} {...ref} {...rest} />
  );
};
