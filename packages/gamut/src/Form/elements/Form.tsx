import styled from '@emotion/styled';
import { styledOptions, system } from '@skillsoft/gamut-styles';
import { variance } from '@skillsoft/variance';
import type { ComponentProps } from 'react';
import type * as React from 'react';
import { forwardRef } from 'react';

const formSystemProps = variance.compose(
  system.space,
  system.border,
  system.layout,
  system.positioning,
  system.flex,
  system.grid
);

const StyledForm = styled('form', styledOptions<'form'>())(formSystemProps);

export type FormProps = ComponentProps<typeof StyledForm>;

export const Form: React.FC<FormProps> = forwardRef(
  ({ method = 'post', ...props }, ref) => {
    return <StyledForm {...props} method={method} noValidate ref={ref} />;
  }
);
