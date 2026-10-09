import type { GamutIconProps } from '@skillsoft/gamut-icons';
// eslint-disable-next-line @skillsoft/gamut/import-paths
import * as miniIcons from '@skillsoft/gamut-icons/src/icons/mini';
import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';

import { ImageGallery } from '~styleguide/blocks';

type MiniIconProps = GamutIconProps & {
  icon: typeof miniIcons.MiniStarIcon;
};

const MiniIconComponent: React.FC<MiniIconProps> = ({
  icon: Icon,
  ...rest
}) => {
  return <Icon {...rest} />;
};

const meta: Meta<typeof MiniIconComponent> = {
  component: MiniIconComponent,
  argTypes: {
    icon: {
      options: Object.keys(miniIcons),
      mapping: miniIcons,
      control: 'select',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MiniIconComponent>;

export const Default: Story = {
  args: {
    size: 16,
    icon: miniIcons.MiniStarIcon,
  },
};

export const AllMiniIcons: Story = {
  // Skip the render/a11y test on the full gallery — it's a visual catalog of
  // every icon (slow to render + axe), and `Default` already covers the
  // component's behavior. `!test` removes the auto-applied `test` tag so
  // addon-vitest ignores this story (it still shows in Storybook).
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={miniIcons} />;
  },
};
