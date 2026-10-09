import type * as React from 'react';

import { ConnectedForm } from '../../ConnectedForm';
import type { WithChildrenProp } from '../../utils';

interface FormContextProps extends WithChildrenProp {
  mode?: 'onChange' | 'onSubmit';
}

export const FormContext: React.FC<FormContextProps> = ({
  mode = 'onSubmit',
  children,
}) => {
  return (
    <ConnectedForm validation={mode} onSubmit={() => null}>
      {children}
    </ConnectedForm>
  );
};
