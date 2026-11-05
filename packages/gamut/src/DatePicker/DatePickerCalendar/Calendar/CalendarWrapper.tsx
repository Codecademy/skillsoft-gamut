import { CheckerDense } from '@skillsoft/gamut-patterns';
import type * as React from 'react';

import { Box } from '../../../Box';
import type { WithChildrenProp } from '../../../utils';
import {
  checkerPatternColor,
  useCheckerPattern,
} from '../../../utils/elevation';

/* A floating surface: `surface-raised` with a `border-subtle` edge. */
export const CalendarWrapper: React.FC<WithChildrenProp> = ({ children }) => {
  const showPattern = useCheckerPattern();
  return (
    <Box color={checkerPatternColor} position="relative" width="max-content">
      {showPattern && <CheckerDense left={8} position="absolute" top={8} />}
      <Box
        bg="surface-raised"
        border={1}
        borderColor="border-subtle"
        borderRadius="sm"
        color="text-default"
        position="relative"
        zIndex={1}
      >
        {children}
      </Box>
    </Box>
  );
};
