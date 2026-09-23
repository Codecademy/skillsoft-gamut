import styled from '@emotion/styled';
import type { BadgeProps} from '@skillsoft/gamut';
import { Badge, Box } from '@skillsoft/gamut';
import { MiniStarIcon } from '@skillsoft/gamut-icons';
import { css } from '@skillsoft/gamut-styles';

export const BadgeTemplate: React.FC<BadgeProps> = (args) => (
  <Badge {...args}>{args.children ? args.children : args.variant}</Badge>
);

const AbsoluteBadge = styled(Badge)(
  css({ position: 'absolute', top: 12, left: 12 })
);

export const TertiaryFillExample = () => {
  return (
    <Box bg="background-primary" height="30px" pt={16}>
      <AbsoluteBadge icon={MiniStarIcon} variant="tertiaryFill">
        Badge
      </AbsoluteBadge>
      <Box bg="text" height="100%" width="100%" />
    </Box>
  );
};
