import { CodeCelebration } from '@skillsoft/gamut-illustrations';
import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, fn, screen, waitFor, within } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { closeButtonPropsArgTypes } from '~storybook/argTypes';

import { Box, FlexBox } from '../Box';
import { FillButton, StrokeButton } from '../Button';
import { Checkbox } from '../Form';
import { Text } from '../Typography';
import { Modal } from './Modal';

type Story = StoryObj<typeof Modal>;

const openModal: NonNullable<Story['play']> = async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open modal' }));
  await screen.findByRole('dialog');
};

const expectModalClosed = () =>
  waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

const GridContentPlaceholder = ({
  height = 'auto',
  width = 'auto',
}: {
  height: string | number;
  width: string | number;
}) => (
  <FlexBox flexDirection="column">
    <FlexBox height="2rem" justifyContent="space-between" mb={12} width="100%">
      <Box bg="beige" height="inherit" width="85%" />
      <Box bg="beige" height="inherit" width="10%" />
    </FlexBox>
    <Box bg="beige" height={height} width={width} />
  </FlexBox>
);

const ImageComponent = () => (
  <FlexBox
    aria-label="Code celebration"
    bg="background-primary"
    center
    height="100%"
    p={4}
    role="img"
    width="100%"
  >
    <CodeCelebration height="100%" />
  </FlexBox>
);

const onNext = fn();
const onBack = fn();
const onCancel = fn();
const onConfirm = fn();

const meta: TypeWithDeepControls<Meta<typeof Modal>> = {
  title: 'Overlays/Modal',
  component: Modal,
  args: {
    title: 'Modal Modality',
    size: 'small',
    children: 'Close the Modal!',
    onRequestClose: fn(),
  },
  argTypes: {
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large', 'fluid'],
    },
    ...closeButtonPropsArgTypes({
      defaultTipText: 'Close modal',
      defaultTipAlignment: 'top-center',
    }),
  },
  render: function ModalWithTrigger(args) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open modal</FillButton>
        <Modal
          {...args}
          isOpen={isOpen}
          onRequestClose={() => {
            setIsOpen(false);
            args.onRequestClose();
          }}
        />
      </>
    );
  },
};

export default meta;

export const Default: Story = {
  play: async (context) => {
    await expect(screen.queryByRole('dialog')).toBeNull();
    await expect(screen.queryByText('Modal Modality')).toBeNull();

    await openModal(context);
    const dialog = within(screen.getByRole('dialog'));
    dialog.getByText('Modal Modality');
    dialog.getByText('Close the Modal!');

    const closeButton = dialog.getByRole('button', { name: 'Close modal' });
    await expect(closeButton).toBeEnabled();
    await context.userEvent.click(closeButton);
    await expect(context.args.onRequestClose).toHaveBeenCalledTimes(1);
    await expectModalClosed();
  },
};

export const Dismissal: Story = {
  play: async (context) => {
    const { args, userEvent } = context;

    await openModal(context);
    await userEvent.click(screen.getByTestId('modal-content'));
    await expect(args.onRequestClose).not.toHaveBeenCalled();
    screen.getByRole('dialog');

    await userEvent.keyboard('{Escape}');
    await expect(args.onRequestClose).toHaveBeenCalledTimes(1);
    await expectModalClosed();

    await openModal(context);
    await userEvent.click(screen.getByTestId('overlay-content-container'));
    await expect(args.onRequestClose).toHaveBeenCalledTimes(2);
    await expectModalClosed();
  },
};

export const Fluid: Story = {
  args: {
    size: 'fluid',
    children: <GridContentPlaceholder height="350px" width="540px" />,
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    children: <GridContentPlaceholder height="300px" width="auto" />,
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    children: <GridContentPlaceholder height="240px" width="auto" />,
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    children: <GridContentPlaceholder height="240px" width="auto" />,
  },
};

export const CloseButtonCustomization: Story = {
  render: function CloseButtonCustomizationModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open modal</FillButton>
        <Modal
          closeButtonProps={{
            ref: closeButtonRef,
            tip: 'Close this very important modal',
            disabled: isDisabled,
          }}
          isOpen={isOpen}
          size="medium"
          title="Close Button Customization Demo"
          onRequestClose={() => setIsOpen(false)}
        >
          <FlexBox flexDirection="column" gap={16}>
            <Text>
              This modal has a customized close button with a ref for
              programmatic focus management, a custom tooltip, and a disabled
              state.
            </Text>
            <FillButton
              disabled={isDisabled}
              onClick={() => closeButtonRef.current?.focus()}
            >
              Focus Close Button
            </FillButton>
            <FillButton onClick={() => setIsDisabled(!isDisabled)}>
              {isDisabled ? 'Enable' : 'Disable'} Focus Close Button
            </FillButton>
          </FlexBox>
        </Modal>
      </>
    );
  },
  play: async (context) => {
    const { userEvent } = context;
    await openModal(context);

    const closeButton = screen.getByRole('button', {
      name: 'Close this very important modal',
    });
    await expect(closeButton).toHaveAttribute(
      'aria-label',
      'Close this very important modal'
    );
    await expect(closeButton).toBeEnabled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Focus Close Button' })
    );
    await expect(closeButton).toHaveFocus();

    await userEvent.click(
      screen.getByRole('button', { name: 'Disable Focus Close Button' })
    );
    await expect(closeButton).toBeDisabled();
  },
};

export const CustomClose: Story = {
  render: function CustomCloseModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open modal</FillButton>
        <Modal
          closeButtonProps={{ hidden: true }}
          isOpen={isOpen}
          size="small"
          title="Modal Modality"
          onRequestClose={() => setIsOpen(false)}
        >
          <FlexBox flexDirection="column" gap={16}>
            <Box>
              <Text>Close the Modal!</Text>
            </Box>
            <Box>
              <StrokeButton onClick={() => setIsOpen(false)}>
                Close
              </StrokeButton>
            </Box>
          </FlexBox>
        </Modal>
      </>
    );
  },
  play: async (context) => {
    await openModal(context);
    await expect(
      screen.queryByRole('button', { name: 'Close modal' })
    ).toBeNull();

    await context.userEvent.click(
      screen.getByRole('button', { name: 'Close' })
    );
    await expectModalClosed();
  },
};

export const ClickOutside: Story = {
  args: {
    closeButtonProps: { hidden: true },
    children: (
      <FlexBox center fit>
        You can close this modal by clicking outside of it
      </FlexBox>
    ),
  },
  play: async (context) => {
    await openModal(context);
    await context.userEvent.click(
      screen.getByTestId('overlay-content-container')
    );
    await expectModalClosed();
  },
};

export const Scrollable: Story = {
  args: {
    closeButtonProps: { hidden: true },
    scrollable: true,
    size: 'medium',
    title: undefined,
    'aria-label': 'Scrollable modal',
    children: (
      <FlexBox flexDirection="column">
        <Box height="600px">
          Hello, I&apos;m a very large box... Try zooming in and you&apos;ll be
          able to scroll down to the button!
        </Box>
        <FillButton>Better remember to put me in!</FillButton>
      </FlexBox>
    ),
  },
  play: async (context) => {
    await openModal(context);
    screen.getByRole('button', { name: 'Better remember to put me in!' });
  },
};

export const FocusManagement: Story = {
  render: function FocusManagementModal() {
    const [isOpen, setIsOpen] = useState(false);
    const containerFocusRef = useRef<HTMLDivElement>(null);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open modal</FillButton>
        <Modal
          containerFocusRef={containerFocusRef}
          isOpen={isOpen}
          size="medium"
          title="Focus Management Demo"
          onRequestClose={() => setIsOpen(false)}
        >
          <FlexBox flexDirection="column" gap={16}>
            <Text>
              This modal demonstrates programmatic focus control. The modal
              container has a ref that you can interact with programmatically.
            </Text>
            <FlexBox gap={8}>
              <FillButton onClick={() => containerFocusRef.current?.focus()}>
                Focus Modal Container
              </FillButton>
            </FlexBox>
            <Text color="text-disabled" fontSize={14}>
              Try tabbing through the page - the modal container will maintain
              focus when you click the &quot;Focus Modal Container&quot; button.
            </Text>
          </FlexBox>
        </Modal>
      </>
    );
  },
  play: async (context) => {
    await openModal(context);
    await context.userEvent.click(
      screen.getByRole('button', { name: 'Focus Modal Container' })
    );
    await expect(screen.getByRole('dialog')).toHaveFocus();
  },
};

export const WithImage: Story = {
  args: {
    image: <ImageComponent />,
    children: (
      <Text fontSize={14} my={12} smooth>
        Optional 1-2 lines of explanation that provides relevant details. Lorem
        ipsum cras nulla massa odio ligula.
      </Text>
    ),
  },
  play: async (context) => {
    await openModal(context);
    within(screen.getByRole('dialog')).getByLabelText('Code celebration');
  },
};

export const MultipleViews: Story = {
  args: {
    title: undefined,
    size: 'medium',
    children: undefined,
    views: [
      {
        title: 'First view',
        primaryCta: { actionType: 'next', children: 'Next', onClick: onNext },
        secondaryCta: {
          actionType: 'cancel',
          children: 'Cancel',
          onClick: onCancel,
        },
        children: <>Hey for the first time</>,
      },
      {
        title: 'Second view',
        primaryCta: { actionType: 'next', children: 'Next', onClick: onNext },
        secondaryCta: { actionType: 'back', children: 'Back', onClick: onBack },
        children: <>Hey for the second time</>,
      },
      {
        title: 'Third view',
        primaryCta: {
          actionType: 'confirm',
          children: 'Done',
          onClick: onConfirm,
        },
        secondaryCta: { actionType: 'back', children: 'Back', onClick: onBack },
        children: <>Last one</>,
      },
    ],
  },
  play: async (context) => {
    const { args, userEvent } = context;
    await openModal(context);

    screen.getByText('First view');
    screen.getByText('Hey for the first time');

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await expect(onNext).toHaveBeenCalledTimes(1);
    screen.getByText('Second view');
    await expect(screen.queryByText('Hey for the first time')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    await expect(onBack).toHaveBeenCalledTimes(1);
    screen.getByText('Hey for the first time');
    await expect(screen.queryByText('Hey for the second time')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    screen.getByText('Last one');
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    await expect(onConfirm).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await expect(onCancel).toHaveBeenCalledTimes(1);
    await expect(args.onRequestClose).toHaveBeenCalledTimes(1);
    await expectModalClosed();
  },
};

export const SingleViewNavigation: Story = {
  args: {
    title: 'Modal title wins',
    size: 'medium',
    children: undefined,
    views: [
      {
        title: 'Hidden view title',
        image: <ImageComponent />,
        primaryCta: { actionType: 'next', children: 'Next' },
        secondaryCta: { actionType: 'back', children: 'Back' },
        children: <>Only one view</>,
      },
    ],
  },
  play: async (context) => {
    await openModal(context);

    screen.getByText('Modal title wins');
    screen.getByText('Only one view');
    await expect(screen.queryByText('Hidden view title')).toBeNull();
    within(screen.getByRole('dialog')).getByLabelText('Code celebration');
    await expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    await expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  },
};

export const DisabledCtas: Story = {
  args: {
    title: undefined,
    size: 'medium',
    children: undefined,
    views: [
      {
        title: 'Disabled actions',
        primaryCta: { actionType: 'confirm', children: 'Done', disabled: true },
        secondaryCta: {
          actionType: 'cancel',
          children: 'Cancel',
          disabled: true,
        },
        children: <>Both actions are disabled</>,
      },
    ],
  },
  play: async (context) => {
    await openModal(context);

    await expect(screen.getByRole('button', { name: 'Done' })).toBeDisabled();
    await expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  },
};

export const MultipleViewsDisabled: Story = {
  render: function MultipleViewsDisabledModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open modal</FillButton>
        <Modal
          isOpen={isOpen}
          size="medium"
          views={[
            {
              title: 'First view',
              primaryCta: {
                actionType: 'next',
                children: 'Next',
                disabled: !isChecked,
              },
              secondaryCta: { actionType: 'cancel', children: 'Cancel' },
              children: (
                <FlexBox flexDirection="column" gap={16}>
                  <Text>Check the box to enable the Next button</Text>
                  <Checkbox
                    aria-label="I agree to the terms"
                    checked={isChecked}
                    htmlFor="terms-checkbox"
                    label="I agree to the terms"
                    onChange={() => setIsChecked(!isChecked)}
                  />
                </FlexBox>
              ),
            },
            {
              title: 'Second view',
              primaryCta: {
                actionType: 'confirm',
                children: 'Done',
                onClick: () => setIsOpen(false),
              },
              secondaryCta: { actionType: 'back', children: 'Back' },
              children: <>You made it!</>,
            },
          ]}
          onRequestClose={() => setIsOpen(false)}
        />
      </>
    );
  },
  play: async (context) => {
    const { userEvent } = context;
    await openModal(context);

    await expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'I agree to the terms' })
    );
    await expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    screen.getByText('You made it!');

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    await expectModalClosed();
  },
};

export const MultipleViewsDanger: Story = {
  render: function MultipleViewsDangerModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open modal</FillButton>
        <Modal
          isOpen={isOpen}
          size="medium"
          title="Danger!!"
          views={[
            {
              title: 'First view',
              primaryCta: {
                actionType: 'confirm',
                children: 'Delete',
                variant: 'danger',
                onClick: () => setIsOpen(false),
              },
              secondaryCta: { actionType: 'cancel', children: 'Cancel' },
              children: <>I use the danger variant for the confirm button</>,
            },
          ]}
          onRequestClose={() => setIsOpen(false)}
        />
      </>
    );
  },
  play: async (context) => {
    await openModal(context);
    await context.userEvent.click(
      screen.getByRole('button', { name: 'Delete' })
    );
    await expectModalClosed();
  },
};

export const ConfirmationOnClose: Story = {
  render: function ConfirmationOnCloseModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const handleClose = () => {
      if (hasUnsavedChanges) {
        setShowConfirmClose(true);
      } else {
        setIsOpen(false);
      }
    };

    const handleConfirmClose = () => {
      setShowConfirmClose(false);
      setIsOpen(false);
      setHasUnsavedChanges(false);
    };

    const handleCancelClose = () => {
      setShowConfirmClose(false);
    };

    return (
      <>
        <FlexBox flexDirection="column" gap={16}>
          <FlexBox gap={8}>
            <FillButton onClick={() => setIsOpen(true)}>Open modal</FillButton>
            <FillButton
              variant="secondary"
              onClick={() => setHasUnsavedChanges(!hasUnsavedChanges)}
            >
              {hasUnsavedChanges ? 'Mark as Saved' : 'Mark as Unsaved'}
            </FillButton>
          </FlexBox>
          <Text color="text-disabled" fontSize={14}>
            Toggle the unsaved state and try closing the modal to see the
            confirmation behavior. <br />
            Current state:{' '}
            {hasUnsavedChanges ? 'Has unsaved changes' : 'All saved'}
          </Text>
        </FlexBox>
        <Modal
          isOpen={isOpen}
          size="medium"
          title="Confirmation on Close Demo"
          onRequestClose={handleClose}
        >
          <FlexBox flexDirection="column" gap={16}>
            <Text>
              This modal shows a confirmation dialog when you try to close it
              with unsaved changes.
            </Text>
            <Text color="text-disabled" fontSize={14}>
              Current state:{' '}
              {hasUnsavedChanges ? 'Has unsaved changes' : 'All saved'}
            </Text>
          </FlexBox>
        </Modal>
        <Modal
          isOpen={showConfirmClose}
          size="small"
          title="Unsaved Changes"
          onRequestClose={handleCancelClose}
        >
          <FlexBox flexDirection="column" gap={16}>
            <Text>
              You have unsaved changes. Are you sure you want to close?
            </Text>
            <FlexBox gap={8}>
              <FillButton onClick={handleConfirmClose}>Yes, Close</FillButton>
              <FillButton variant="secondary" onClick={handleCancelClose}>
                Cancel
              </FillButton>
            </FlexBox>
          </FlexBox>
        </Modal>
      </>
    );
  },
  play: async (context) => {
    const { userEvent } = context;
    await openModal(context);

    await userEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    await screen.findByText('Unsaved Changes');

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(screen.queryByText('Unsaved Changes')).toBeNull()
    );
    screen.getByText('Confirmation on Close Demo');

    await userEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Yes, Close' })
    );
    await expectModalClosed();
  },
};
