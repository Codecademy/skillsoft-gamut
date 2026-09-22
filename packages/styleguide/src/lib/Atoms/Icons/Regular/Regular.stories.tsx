import { GamutIconProps } from '@skillsoft/gamut-icons';
// eslint-disable-next-line @skillsoft/gamut/import-paths
import * as icons from '@skillsoft/gamut-icons/src/icons/regular';
import type { Meta, StoryObj } from '@storybook/react';

import { ImageGallery } from '~styleguide/blocks';

import { LE_ICONS, SKILLS_ICONS, UI_ICONS, VENDOR_ICONS } from '../constants';

type IconProps = GamutIconProps & {
  icon: typeof icons.AlertIcon;
};

const IconComponent: React.FC<IconProps> = ({ icon: Icon, ...rest }) => {
  return <Icon {...rest} />;
};

const meta: Meta<typeof IconComponent> = {
  component: IconComponent,
  argTypes: {
    icon: {
      options: Object.keys(icons),
      mapping: icons,
      control: 'select',
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconComponent>;

export const Default: Story = {
  args: {
    size: 40,
    icon: icons.AlertIcon,
  },
};

// The gallery stories are visual catalogs of every icon (slow to render + axe,
// and redundant with `Default`). `!test` removes the auto-applied `test` tag so
// addon-vitest skips them; they still render in Storybook.
export const RegularInterfaceIcons: Story = {
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={UI_ICONS} />;
  },
};

export const RegularLearningEnvironmentIcons: Story = {
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={LE_ICONS} />;
  },
};

export const RegularVendorIcons: Story = {
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={VENDOR_ICONS} />;
  },
};

export const RegularSkillIcons: Story = {
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={SKILLS_ICONS} />;
  },
};
