import { Box } from '@codecademy/gamut';
import { Video, type VideoProps } from '@codecademy/gamut/Video';

export const Player = (props: VideoProps) => (
  <Box>
    <Video {...props} />
  </Box>
);
