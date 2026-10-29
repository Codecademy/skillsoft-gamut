import styled from '@emotion/styled';
import { states, variant } from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';

import { Anchor } from '../Anchor';
import { FlexBox } from '../Box';
import { FillButton, StrokeButton, TextButton } from '../Button';

const disclosureWrapperVariants = variant({
  defaultVariant: 'default',
  base: {
    width: '100%',
    maxHeight: 'fit-content',
    borderRadius: 'md',
  },
  variants: {
    default: {
      bg: 'surface-raised',
    },
    subtle: {
      bg: 'surface-sunken',
    },
    transparent: {
      bg: 'inherit',
    },
  },
});

const disclosureWrapperStates = states({
  hasBorder: {
    border: 1,
    borderColor: 'border-default',
  },
});

type DisclosureWrapperStateProps = StyleProps<typeof disclosureWrapperStates>;
type DisclosureWrapperVariantProps = StyleProps<
  typeof disclosureWrapperVariants
>;
export type DisclosureWrapperStyles = DisclosureWrapperStateProps &
  DisclosureWrapperVariantProps;

export const DisclosureWrapper = styled(FlexBox)<DisclosureWrapperStyles>(
  disclosureWrapperStates,
  disclosureWrapperVariants
);

export const DisclosureButtonWrapper = styled(Anchor)(
  variant({
    prop: 'isWrapper',
    defaultVariant: 'default',
    base: {
      borderRadius: 'md',
    },
    variants: {
      default: {
        bg: 'inherit',
        '&:hover': {
          color: 'text-default',
          bg: 'state-hover',
        },
        /* Focus is a ring, not a fill. */
        '&:focus': {
          color: 'text-default',
          outline: '2px solid',
          outlineColor: 'action-primary',
          outlineOffset: '-2px',
        },
        '&:disabled': {
          color: 'surface-raised',
          bg: 'action-disabled',
        },
      },
    },
  })
);

const sharedVariants = {
  left: {
    alignSelf: 'flex-start',
    justifyContent: 'left',
  },
  right: {
    alignSelf: 'flex-end',
    justifyContent: 'right',
  },
};

export const StyledTextButton = styled(TextButton)(
  variant({
    prop: 'placement',
    variants: sharedVariants,
  })
);

export const StyledStrokeButton = styled(StrokeButton)(
  variant({
    prop: 'placement',
    variants: sharedVariants,
  })
);

export const StyledFillButton = styled(FillButton)(
  variant({
    prop: 'placement',
    variants: sharedVariants,
  })
);

const disclosureBodyWrapperStates = states({
  hasPanelBg: {
    bg: 'surface-sunken',
    p: 8,
  },
});

export type DisclosureBodyWrapperStyles = StyleProps<
  typeof disclosureBodyWrapperStates
>;

export const DisclosureBodyWrapper = styled(
  FlexBox
)<DisclosureBodyWrapperStyles>(disclosureBodyWrapperStates);
