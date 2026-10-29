import * as patterns from '@skillsoft/gamut-patterns';
import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { expect, screen, waitFor } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { FlexBox } from '../Box';
import { FillButton } from '../Button';
import { Text } from '../Typography';
import { Coachmark } from '.';

const popoverText = 'You should click the button.';

const meta: TypeWithDeepControls<Meta<typeof Coachmark>> = {
  title: 'Feedback/Coachmark',
  component: Coachmark,
  args: {
    popoverProps: {
      beak: undefined,
      position: 'below',
    },
  },
  argTypes: {
    skipFocusTrap: {
      control: 'boolean',
    },
    'popoverProps.beak': {
      control: 'radio',
      options: ['left', 'right', 'center'],
      table: {
        type: {
          summary: 'left | right | center',
        },
      },
      description:
        'Which side to position the beak. If not provided, beak will not be rendered. Position `center` Popovers can only be used with `center` beaks.',
    },
    'popoverProps.outline': {
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
      },
      description: 'Whether to add outline style.',
    },
    'popoverProps.pattern': {
      control: 'select',
      options: Object.keys(patterns),
      mapping: patterns,
      description: 'Pattern component to use as a background.',
    },
    'popoverProps.position': {
      control: 'radio',
      options: ['above', 'below'],
      table: {
        type: {
          summary: 'above | below',
        },
      },
      description:
        'Which horizontal edge of the source component to align against.',
    },
    'popoverProps.align': {
      control: 'radio',
      options: ['left', 'right', 'center'],
      table: {
        type: {
          summary: 'left | right | center',
        },
      },
      description:
        'Which vertical edge of the source component to align against.',
    },
    'popoverProps.verticalOffset': {
      control: 'number',
      table: {
        type: {
          summary: 'number',
        },
      },
      description:
        'Number of pixels to offset the popover vertically from the source component.',
    },
    'popoverProps.horizontalOffset': {
      control: 'number',
      table: {
        type: {
          summary: 'number',
        },
      },
      description:
        'Number of pixels to offset the popover horizontally from the source component.',
    },
    'popoverProps.widthRestricted': {
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
      },
      description: 'Whether to add width restrictions to Popover.',
    },
  },
  render: function CoachmarkExample(args) {
    const [shouldShow, setShouldShow] = useState(args.shouldShow);

    useEffect(() => {
      setShouldShow(args.shouldShow);
    }, [args.shouldShow]);

    return (
      <FlexBox width="min-content">
        <Coachmark
          {...args}
          renderPopover={() => (
            <FlexBox alignItems="flex-start" flexDirection="column" p={16}>
              <Text mb={8}>{popoverText}</Text>
              <FillButton size="small" onClick={() => setShouldShow(false)}>
                Got it
              </FillButton>
            </FlexBox>
          )}
          shouldShow={shouldShow}
        >
          <FillButton onClick={() => setShouldShow(true)}>A Button</FillButton>
        </Coachmark>
      </FlexBox>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Coachmark>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(screen.queryByText(popoverText)).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'A Button' }));
    await screen.findByText(popoverText);
    canvas.getByRole('button', { name: 'A Button' });

    await userEvent.click(screen.getByRole('button', { name: 'Got it' }));
    await waitFor(() => expect(screen.queryByText(popoverText)).toBeNull());
  },
};

export const Delay: Story = {
  args: {
    delay: 1000,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'A Button' }));
    await expect(screen.queryByText(popoverText)).toBeNull();

    await screen.findByText(popoverText, undefined, { timeout: 2000 });
  },
};

export const Customized: Story = {
  args: {
    popoverProps: {
      beak: 'left',
      outline: true,
      pattern: patterns.CheckerDense,
      position: 'above',
    },
  },
};
