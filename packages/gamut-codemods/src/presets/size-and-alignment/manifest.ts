import type { Manifest, PropChange } from '../../lib/manifest';
import { manifest as scopeSwapManifest } from '../scope-swap/manifest';

/*
  The size scale is now sm / md / lg (xl where a component already had it),
  and left / right alignment values are now start / end. Every entry uses
  the NEW package name: this preset runs on code that already imports
  @skillsoft/gamut. Consumers still on @codecademy/gamut run scope-swap first.

  Values are per component, because the same prop name means different
  things on different components. Modal's `size` is not Button's `size`.
*/

const BUTTON_SIZE: Record<string, string> = {
  normal: 'md',
  small: 'sm',
  large: 'lg',
};

const START_END: Record<string, string> = {
  left: 'start',
  right: 'end',
};

/* Tips and PopoverContainer alignments: the physical corner and side values. */
const TIP_ALIGNMENT: Record<string, string> = {
  'top-left': 'top-start',
  'top-right': 'top-end',
  'bottom-left': 'bottom-start',
  'bottom-right': 'bottom-end',
  'left-center': 'start-center',
  'right-center': 'end-center',
};

const POPOVER_CONTAINER_ALIGNMENT: Record<string, string> = {
  ...TIP_ALIGNMENT,
  left: 'start',
  right: 'end',
};

const sizes = (values: Record<string, string>): PropChange => ({ values });

const buttonProps: Record<string, PropChange> = {
  size: sizes(BUTTON_SIZE),
  iconPosition: { values: START_END },
};

export const manifest: Manifest = {
  ...scopeSwapManifest,
  componentProps: {
    package: '@skillsoft/gamut',
    components: {
      /* Size: the scale is sm / md / lg. */
      FillButton: buttonProps,
      StrokeButton: buttonProps,
      TextButton: buttonProps,
      IconButton: { size: sizes(BUTTON_SIZE) },
      Input: {
        size: sizes({ base: 'md', small: 'sm' }),
      },
      FormGroupLabel: {
        size: sizes({ small: 'sm', large: 'lg' }),
      },
      FormGroup: {
        labelSize: sizes({ small: 'sm', large: 'lg' }),
      },
      ConnectedFormGroup: {
        labelSize: sizes({ small: 'sm', large: 'lg' }),
      },
      Select: {
        sizeVariant: { rename: 'size', values: { small: 'sm', base: 'md' } },
      },
      SelectDropdown: {
        size: sizes({ small: 'sm', medium: 'md' }),
        menuAlignment: { values: START_END },
      },
      Toggle: {
        size: sizes({ medium: 'md', small: 'sm' }),
      },
      ProgressBar: {
        size: sizes({ small: 'sm', medium: 'md', large: 'lg' }),
      },
      Badge: {
        size: sizes({ base: 'md' }),
      },
      DatePicker: {
        inputSize: sizes({ base: 'md', small: 'sm' }),
      },

      /* Left / right alignment: start / end. */
      Alert: { iconPosition: { values: START_END } },
      Anchor: { iconPosition: { values: START_END } },
      Disclosure: { buttonPlacement: { values: START_END } },
      Drawer: { alignContentContainer: { values: START_END } },
      Flyout: { openFrom: { values: START_END } },
      GridForm: { layout: { values: { left: 'start' } } },
      Popover: {
        align: { values: START_END },
        beak: { values: START_END },
      },
      Coachmark: { beak: { values: START_END } },
      PopoverContainer: {
        alignment: { values: POPOVER_CONTAINER_ALIGNMENT },
      },
      ToolTip: { alignment: { values: TIP_ALIGNMENT } },
      InfoTip: { alignment: { values: TIP_ALIGNMENT } },
      PreviewTip: { alignment: { values: TIP_ALIGNMENT } },
    },
  },
};
