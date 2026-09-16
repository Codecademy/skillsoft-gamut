import { Box } from '@skillsoft/gamut';
import { css } from '@skillsoft/gamut-styles';
import styled from '@emotion/styled';

const heroContainerStyles = css({
  display: 'flex',
  flexDirection: 'column',
  p: 16,
  mt: 24,
  color: 'white',
});

export const HeroContainer = styled(Box)(heroContainerStyles);
