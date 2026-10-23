import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';

import { ImageGallery } from '~storybook/blocks';

import type { GamutIconProps } from '.';
import * as miniIcons from './icons/mini';

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
  title: 'Media & Assets/Icons/Mini',
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

// Visual catalog of every mini icon — slow to render + axe, and redundant with
// `Default`. `!test` removes the auto-applied `test` tag so addon-vitest skips
// it; it still renders in Storybook.
export const AllMiniIcons: Story = {
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={miniIcons} />;
  },
};
