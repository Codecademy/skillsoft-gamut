import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, fn } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { closeButtonPropsArgTypes } from '~storybook/argTypes';

import { Box, FlexBox } from '../Box';
import { FillButton } from '../Button';
import { Text } from '../Typography';
import { Alert } from './Alert';

const meta: TypeWithDeepControls<Meta<typeof Alert>> = {
  title: 'Feedback/Alert',
  component: Alert,
  args: {},
  argTypes: {
    ...closeButtonPropsArgTypes({
      defaultTipText: 'Close alert',
      defaultTipAlignment: 'bottom-center',
    }),
    'closeButtonProps.hidden': {
      table: {
        disable: true,
      },
    },
    placement: {
      control: 'radio',
      options: ['floating', 'inline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

const ALERTS = {
  general: {
    type: 'general',
    children:
      'Please verify your email so we can make sure your account is secure. A link has been sent to name@email.com.',
    cta: { children: 'Resend verification' },
  },
  success: {
    type: 'success',
    cta: { children: '' },
    children: <>Success! Your content has been assigned.</>,
  },
  feature: {
    type: 'feature',
    cta: { children: 'Add your name' },
    children:
      'Update your profile with your name to help your team with account management.',
  },
  notice: {
    type: 'notice',
    cta: { children: 'Learn more' },
    children: (
      <>Maintenance: Codecademy will be offline between 2AM and 4AM EST.</>
    ),
  },
  error: {
    type: 'error',
    cta: { children: '' },
    children:
      'We were unable to add this team member. Please refresh the page and try again.',
  },
  subtle: {
    type: 'subtle',
    cta: { children: 'Learn more' },
    children: 'Subtly alerting the user',
  },
} as const;

const longMessage =
  'This alert has a long message that does not fit on a single line, so the floating alert truncates it and renders a button that expands the full message. Collapse it again to save space on the page.';

export const Default: Story = {
  args: {
    children: 'This is an alert',
    cta: { children: 'Click Me', onClick: fn() },
    onClose: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Click Me' }));
    await expect(args.cta?.onClick).toHaveBeenCalledTimes(1);

    const closeButton = canvas.getByRole('button', { name: 'Close alert' });
    await expect(closeButton).toHaveAttribute('aria-label', 'Close alert');
    await expect(closeButton).toBeEnabled();

    await userEvent.click(closeButton);
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const General: Story = {
  args: {
    ...ALERTS.general,
  },
};

export const Success: Story = {
  args: {
    ...ALERTS.success,
  },
};

export const Feature: Story = {
  args: {
    ...ALERTS.feature,
  },
};

export const Notice: Story = {
  args: {
    ...ALERTS.notice,
  },
};

export const Error: Story = {
  args: {
    ...ALERTS.error,
  },
};

export const Subtle: Story = {
  args: {
    ...ALERTS.subtle,
  },
};

export const GeneralInline: Story = {
  args: {
    ...ALERTS.general,
    placement: 'inline',
  },
};

export const SuccessInline: Story = {
  args: {
    ...ALERTS.success,
    placement: 'inline',
  },
};

export const FeatureInline: Story = {
  args: {
    ...ALERTS.feature,
    placement: 'inline',
  },
};

export const NoticeInline: Story = {
  args: {
    ...ALERTS.notice,
    placement: 'inline',
  },
};

export const ErrorInline: Story = {
  args: {
    ...ALERTS.error,
    placement: 'inline',
  },
};

export const SubtleInline: Story = {
  args: {
    ...ALERTS.subtle,
    placement: 'inline',
  },
};

export const CtaLink: Story = {
  args: {
    children: 'This alert links somewhere',
    cta: {
      children: 'Read the docs',
      href: '#alert-cta',
      onClick: fn((event: React.MouseEvent) => event.preventDefault()),
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const cta = canvas.getByRole('link', { name: 'Read the docs' });
    await expect(cta).toHaveAttribute('href', '#alert-cta');

    await userEvent.click(cta);
    await expect(args.cta?.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Truncated: Story = {
  render: () => (
    <Box width="640px">
      <Alert type="general">{longMessage}</Alert>
    </Box>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByText(longMessage)).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Expand' }));
    canvas.getByText(longMessage);

    await userEvent.click(canvas.getByRole('button', { name: 'Collapse' }));
    canvas.getByRole('button', { name: 'Expand' });
  },
};

export const SmallWidth: Story = {
  render: () => (
    <Box width="400px">
      <Alert cta={{ children: 'Add your name' }} type="general">
        {longMessage}
      </Alert>
    </Box>
  ),
  play: async ({ canvas }) => {
    canvas.getByText(longMessage);
    await expect(canvas.queryByRole('button', { name: 'Expand' })).toBeNull();
  },
};

export const WithCloseButton: Story = {
  args: {
    children: 'This is an alert',
    type: 'general',
    onClose: fn(),
  },
};

export const CloseButtonDisabled: Story = {
  args: {
    children: 'This alert cannot be closed yet',
    closeButtonProps: { disabled: true },
    onClose: fn(),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Close alert' })
    ).toBeDisabled();
  },
};

export const Dismissible: Story = {
  render: function DismissibleAlert() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
      return (
        <Box p={16}>
          <Text>Alert has been dismissed!</Text>
          <FillButton onClick={() => setIsVisible(true)}>
            Show Alert Again
          </FillButton>
        </Box>
      );
    }

    return (
      <Alert onClose={() => setIsVisible(false)}>
        This is a dismissible alert. Click the X button to dismiss it!
      </Alert>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Close alert' }));
    canvas.getByText('Alert has been dismissed!');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show Alert Again' })
    );
    canvas.getByRole('button', { name: 'Close alert' });
  },
};

export const CloseButtonCustomization: Story = {
  render: function CloseButtonCustomizationAlert() {
    const [isVisible, setIsVisible] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    return (
      <>
        {!isVisible && (
          <FillButton onClick={() => setIsVisible(true)}>
            Show Alert with Custom Close Button
          </FillButton>
        )}
        {isVisible && (
          <Alert
            closeButtonProps={{
              tip: 'Wow, a left-aligned tooltip!',
              ref: closeButtonRef,
              tipAlignment: 'left-center',
            }}
            type="feature"
            onClose={() => setIsVisible(false)}
          >
            <FlexBox flexDirection="column" gap={16}>
              <Text>Expand this Alert to see focus controls</Text>
              <FlexBox gap={8}>
                <FillButton
                  disabled={isDisabled}
                  onClick={() => closeButtonRef.current?.focus()}
                >
                  Focus Close Button
                </FillButton>
                <FillButton onClick={() => setIsDisabled(!isDisabled)}>
                  {isDisabled ? 'Enable' : 'Disable'} Focus Button
                </FillButton>
              </FlexBox>
            </FlexBox>
          </Alert>
        )}
      </>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const closeButton = canvas.getByRole('button', {
      name: 'Wow, a left-aligned tooltip!',
    });
    await expect(closeButton).toHaveAttribute(
      'aria-label',
      'Wow, a left-aligned tooltip!'
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Expand' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Focus Close Button' })
    );
    await expect(closeButton).toHaveFocus();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Disable Focus Button' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Focus Close Button' })
    ).toBeDisabled();

    await userEvent.click(closeButton);
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Show Alert with Custom Close Button',
      })
    );
    canvas.getByRole('button', { name: 'Wow, a left-aligned tooltip!' });
  },
};
