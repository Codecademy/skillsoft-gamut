import styled from '@emotion/styled';
import { theme, variant } from '@skillsoft/gamut-styles';
import { StyleProps } from '@skillsoft/variance';
import { HTMLAttributes } from 'react';
import * as React from 'react';

const errorSpanVariants = variant({
  base: {
    left: 0,
    top: `calc(100% - ${theme.spacing[8]})`,
    color: 'feedback-error',
    display: 'inline-block',
    fontSize: 'small',
  },
  defaultVariant: 'initial',
  variants: {
    initial: {
      position: 'initial',
    },
    absolute: {
      position: 'absolute',
    },
    inlineCentered: {
      position: 'initial',
      textAlign: 'center',
    },
  },
});

const ErrorSpan = styled.span(errorSpanVariants);

type FormErrorProps = StyleProps<typeof errorSpanVariants> &
  HTMLAttributes<HTMLSpanElement>;

export const FormError: React.FC<FormErrorProps> = (props) => {
  return <ErrorSpan {...props} />;
};
