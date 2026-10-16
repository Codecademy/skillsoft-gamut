import type { Meta, StoryObj } from '@storybook/react';

import { ImageGallery } from '~storybook/blocks';

import type { PatternProps } from '.';
import * as patterns from '.';

type PatternComponentProps = PatternProps & {
  pattern: React.ComponentType<PatternProps>;
};

const PatternComponent: React.FC<PatternComponentProps> = ({
  pattern: Pattern,
  ...rest
}) => {
  return <Pattern {...rest} />;
};

const meta: Meta<typeof PatternComponent> = {
  title: 'Media & Assets/Patterns',
  component: PatternComponent,
  argTypes: {
    pattern: {
      options: Object.keys(patterns),
      mapping: patterns,
      control: 'select',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PatternComponent>;

export const Default: Story = {
  args: {
    height: 200,
    pattern: patterns.DotLoose,
  },
};

// Visual catalog of every pattern — slow to render + axe, and redundant with
// `Default`. `!test` removes the auto-applied `test` tag so addon-vitest skips
// it; it still renders in Storybook.
export const AllPatterns: Story = {
  tags: ['!test'],
  render: () => {
    return (
      <ImageGallery
        controls={{ imageSize: 50, maxImageSize: 200 }}
        imageType="pattern"
        images={patterns}
      />
    );
  },
};
