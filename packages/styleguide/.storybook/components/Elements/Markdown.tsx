import { Anchor } from '@skillsoft/gamut';
import { themed } from '@skillsoft/gamut-styles';
import styled from '@emotion/styled';
import { linkTo } from '@storybook/addon-links';
import { ComponentProps } from 'react';
import * as React from 'react';

export const Reset = styled.div`
  p:first-of-type {
    margin-top: 0;
  }
`;

type LinkProps = Omit<ComponentProps<typeof Anchor>, 'variant'> & {
  id: string;
  variant?: ComponentProps<typeof Anchor>['variant'] | 'area';
};

export const Link: React.FC<LinkProps> = ({ ref, id, variant, ...props }) => {
  const storyId = id;

  const onClick = linkTo(storyId);

  if (variant === 'area') {
    return <Anchor {...props} onClick={onClick} variant="interface" />;
  }
  return (
    <Anchor {...props} onClick={onClick} target="_blank" variant={variant} />
  );
};

export const LinkTo = Link;

export const Code = styled.code`
  max-width: 100%;
  overflow-x: auto;
  line-height: 1;
  padding: 5px 7px 1px;
  white-space: nowrap;
  border-radius: 3px;
  font-size: 0.8em;
  border: 1px solid ${themed('colors.border-subtle')};
  color: ${themed('colors.text-default')};
  background-color: ${themed('colors.surface-sunken')};
  display: inline-block;

  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${themed('colors.border-subtle')};
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }
`;
