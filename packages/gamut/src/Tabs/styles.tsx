import { system, variant } from '@skillsoft/gamut-styles';

export const tabContainerVariants = variant({
  base: {
    display: 'flex',
  },
  defaultVariant: 'standard',
  variants: {
    standard: {
      position: 'relative',
      mb: 24,
      '&:after': {
        content: '""',
        height: '1px',
        bg: 'border-subtle',
        position: 'absolute',
        bottom: 0,
        zIndex: 0,
        width: '100%',
      },
    },
    /* A sunken track with a raised selected tab, in the page's own mode. */
    block: {
      bg: 'surface-sunken',
      mb: 16,
    },
  },
});

export const tabContainerStates = system.states({
  fill: {
    display: 'grid',
    gridAutoColumns: '1fr',
    gridTemplateRows: 'auto',
    gridAutoFlow: 'column',
  },
});
