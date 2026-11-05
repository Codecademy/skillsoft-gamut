import { Box, Video, type VideoProps } from '@codecademy/gamut';

export const Player = (props: VideoProps) => (
  <Box>
    <Video {...props} />
  </Box>
);
