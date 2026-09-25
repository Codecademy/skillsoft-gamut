import { Preview } from '@storybook/react';

import theme from './theming/GamutTheme';
import { withEmotion } from './theming/GamutThemeProvider';
import { DocsContainer } from './components/Elements/DocsContainer';
import { breakpoints } from '@skillsoft/gamut-styles';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'error',
    },
    backgrounds: {
      disable: true,
    },
    deepControls: { enabled: true },
    docs: {
      container: DocsContainer,
      theme,
    },
    options: {
      storySort: {
        method: 'configure',
        includeNames: true,
        order: [
          'Foundations',
          'Layouts',
          'Typography',
          'Atoms',
          'Molecules',
          'Organisms',
          '*',
        ],
      },
    },
    viewport: {
      options: {
        xs: {
          name: `XS - ${breakpoints.xs}`,
          styles: {
            width: breakpoints.xs,
            height: '900px',
          },
          type: 'mobile',
        },
        sm: {
          name: `SM - ${breakpoints.sm}`,
          styles: {
            width: breakpoints.sm,
            height: '1024px',
          },
          type: 'tablet',
        },
        md: {
          name: `MD - ${breakpoints.md}`,
          styles: {
            width: breakpoints.md,
            height: '768px',
          },
          type: 'desktop',
        },
        lg: {
          name: `LG - ${breakpoints.lg}`,
          styles: {
            width: breakpoints.lg,
            height: '900px',
          },
          type: 'desktop',
        },
        xl: {
          name: `XL - ${breakpoints.xl}`,
          styles: {
            width: breakpoints.xl,
            height: '900px',
          },
          type: 'desktop',
        },
      },
    },
  },
  tags: ['autodocs'],
};

export const globalTypes = {
  colorMode: {
    name: ' ColorMode',
    description: 'Global color mode for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      // Array of plain string values or MenuItem shape (see below)
      items: [
        { value: 'light', icon: 'circlehollow', title: 'Light' },
        { value: 'dark', icon: 'circle', title: 'Dark' },
      ],
      // Property that specifies if the name of the item will be displayed
      showName: true,
    },
  },
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'core',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'core', title: 'Core' },
        { value: 'admin', title: 'Admin' },
        { value: 'lxStudio', title: 'LX Studio' },
        { value: 'percipio', title: 'Percipio' },
        { value: 'platform', title: 'Learning Platform' },
      ],
      showName: true,
    },
  },
  logicalProps: {
    name: 'LogicalProps',
    description: 'Toggle between logical and physical CSS properties',
    defaultValue: 'true',
    toolbar: {
      icon: 'transfer',
      items: [
        { value: 'false', title: 'Physical' },
        { value: 'true', title: 'Logical' },
      ],
      showName: true,
    },
  },
  direction: {
    name: 'Direction',
    description: 'Text direction (LTR or RTL)',
    defaultValue: 'ltr',
    toolbar: {
      icon: 'arrowright',
      items: [
        { value: 'ltr', title: 'Left-to-Right (LTR)', icon: 'arrowright' },
        { value: 'rtl', title: 'Right-to-Left (RTL)', icon: 'arrowleft' },
      ],
      showName: true,
    },
  },
};

export const decorators = [withEmotion];

export default preview;
