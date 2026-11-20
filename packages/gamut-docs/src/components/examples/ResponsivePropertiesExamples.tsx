/**
 * The examples from Storybook's `Foundations/System/Responsive properties`
 * stories (styleguide's `ResponsiveProperties.stories.tsx`), rendered inline
 * with the same props and the same default story args.
 */
import { Box, FlexBox } from '@skillsoft/gamut';

import { GamutExample } from '../GamutExample';

const storyArgs = {
  center: true,
  height: '500px',
  width: 1,
} as const;

export const MediaQueries = () => (
  <GamutExample>
    <FlexBox {...storyArgs}>
      <Box
        bg={{ _: 'paleBlue', md: 'orange' }}
        border={1}
        borderRadius="sm"
        p={16}
      >
        My background color will change at the medium media-query breakpoint.
      </Box>
    </FlexBox>
  </GamutExample>
);

export const ContainerQueries = () => (
  <GamutExample>
    <FlexBox containerType="inline-size" {...storyArgs}>
      <Box
        bg={{ _: 'paleBlue', c_md: 'orange' }}
        border={1}
        borderRadius="sm"
        p={16}
      >
        My background color will change at the medium container-query
        breakpoint.
      </Box>
    </FlexBox>
  </GamutExample>
);

export const CombinedQueries = () => (
  <GamutExample>
    <FlexBox containerType="inline-size" {...storyArgs}>
      <Box
        bg={{
          _: 'beige',
          md: 'background-disabled',
          c_lg: 'primary-inverse',
        }}
        border={1}
        borderRadius="sm"
        p={16}
      >
        My background color will change at the medium media-query breakpoint and
        at the large container-query breakpoint.
      </Box>
    </FlexBox>
  </GamutExample>
);
