import { SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import { GridBox } from '@skillsoft/gamut';
import { boxShadow } from '@skillsoft/gamut-styles';

export const ShadowBox = styled.div<{ shadow?: SerializedStyles }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  ${({ shadow }) => shadow}
`;

export const ShadowExample = () => {
  return (
    <GridBox
      bg="background"
      gap={16}
      gridTemplateColumns="repeat(5, 1fr)"
      p={16}
      width="100%"
    >
      <ShadowBox shadow={boxShadow(1)}>1</ShadowBox>
      <ShadowBox shadow={boxShadow(2)}>2</ShadowBox>
      <ShadowBox shadow={boxShadow(3)}>3</ShadowBox>
      <ShadowBox shadow={boxShadow(4)}>4</ShadowBox>
      <ShadowBox shadow={boxShadow(5)}>5</ShadowBox>
    </GridBox>
  );
};
