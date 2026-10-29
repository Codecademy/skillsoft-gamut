import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { expect, fireEvent, fn, waitFor } from 'storybook/test';

import { Box } from '../Box';
import { FillButton } from '../Button';
import { GridForm } from '../GridForm';
import { FocusTrap } from '.';

const meta: Meta<typeof FocusTrap> = {
  title: 'Utilities/FocusTrap',
  component: FocusTrap,
  args: {
    active: false,
    onClickOutside: fn(),
    onEscapeKey: fn(),
  },
  render: function FocusTrapDemo(args) {
    const [trapActive, setActive] = useState(args.active);
    useEffect(() => {
      setActive(args.active);
    }, [args.active]);

    return (
      <Box>
        <FillButton onClick={() => setActive(true)}>
          Enable Focus Trap
        </FillButton>
        <FocusTrap
          {...args}
          active={trapActive}
          onClickOutside={() => {
            setActive(false);
            args.onClickOutside?.();
          }}
        >
          <Box
            border={1}
            borderColor={trapActive ? 'black' : 'border-subtle'}
            my={24}
            p={24}
          >
            <GridForm
              fields={[
                {
                  label: 'email',
                  name: 'email-text',
                  size: 12,
                  type: 'text',
                },
                {
                  label: 'password',
                  name: 'password-text',
                  size: 12,
                  type: 'password',
                },
              ]}
              submit={{
                contents: 'Disable Focus Trap',
                position: 'right',
                size: 12,
              }}
              onSubmit={() => {
                setActive(false);
              }}
            />
          </Box>
        </FocusTrap>
      </Box>
    );
  },
};

export default meta;

type Story = StoryObj<typeof FocusTrap>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const enable = canvas.getByRole('button', { name: 'Enable Focus Trap' });
    const emailInput = canvas.getByRole('textbox');
    canvas.getByRole('button', { name: 'Disable Focus Trap' });

    await userEvent.click(enable);
    await waitFor(() => expect(emailInput).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await expect(args.onEscapeKey).toHaveBeenCalledTimes(1);

    await userEvent.click(emailInput);
    await expect(args.onClickOutside).not.toHaveBeenCalled();

    await fireEvent.mouseDown(enable);
    await waitFor(() => expect(args.onClickOutside).toHaveBeenCalledTimes(1));
  },
};
