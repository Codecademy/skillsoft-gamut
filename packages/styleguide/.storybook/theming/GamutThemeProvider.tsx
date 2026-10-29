import { useLayoutEffect, useRef } from 'react';
import {
  ColorMode,
  Colors,
  GamutProvider,
  skillsoftTheme,
  originalCodecademyTheme,
  adminTheme,
  lxStudioTheme,
  percipioTheme,
  platformTheme,
} from '@skillsoft/gamut-styles';
import { Theme } from '@emotion/react';

const STORYBOOK_CSP_NONCE = 'storybook-csp-nonce';

/**
 * Story functions must be called as a regular function to avoid full-remounts
 * See: https://github.com/storybookjs/storybook/issues/12255
 */

/* Every theme is a brand of the generated color system. Original Codecademy is core rebuilt. */
const themeMap = {
  skillsoft: skillsoftTheme,
  originalCodecademy: originalCodecademyTheme,
  admin: adminTheme,
  lxStudio: lxStudioTheme,
  percipio: percipioTheme,
  platform: platformTheme,
} as const;

type GlobalsContext = {
  globals: {
    colorMode: 'light' | 'dark';
    theme: keyof typeof themeMap;
    logicalProps: 'true' | 'false';
    direction: 'ltr' | 'rtl';
  };
};

export const withEmotion = (Story: any, context: GlobalsContext) => {
  const colorMode = context.globals.colorMode ?? 'light';
  const selectedTheme = context.globals.theme;
  const useLogicalProperties = context.globals.logicalProps === 'true';
  const direction = context.globals.direction ?? 'ltr';
  const storyRef = useRef<HTMLDivElement>(null);
  const currentTheme = themeMap[selectedTheme];
  /* The page surface of the selected mode, as the palette color it resolves to. */
  const pageBg = currentTheme.modes[colorMode]['background-current'];
  const background = currentTheme._getColorValue(pageBg);

  useLayoutEffect(() => {
    const storyEl = storyRef.current?.closest(
      '.docs-story'
    ) as HTMLDivElement | null;
    if (storyEl) storyEl.style.backgroundColor = background;
  }, [storyRef.current, context.globals.colorMode]);

  useLayoutEffect(() => {
    if (document.documentElement.getAttribute('dir') !== direction) {
      document.documentElement.setAttribute('dir', direction);
    }
  }, [direction]);

  // Always give iframes the full provider
  if (process.env.NODE_ENV === 'test') {
    return (
      <GamutProvider
        useCache={false}
        useGlobals={false}
        useLogicalProperties={useLogicalProperties}
        theme={currentTheme as unknown as Theme}
      >
        <ColorMode
          alwaysSetVariables
          bg={pageBg as Colors}
          mode={colorMode}
          ref={storyRef}
        >
          {Story()}
        </ColorMode>
      </GamutProvider>
    );
  }

  // Wrap all stories in minimal provider
  return (
    <GamutProvider
      useLogicalProperties={useLogicalProperties}
      theme={currentTheme as unknown as Theme}
    >
      <ColorMode
        alwaysSetVariables
        bg={pageBg as Colors}
        mode={colorMode}
        ref={storyRef}
      >
        {Story()}
      </ColorMode>
    </GamutProvider>
  );
};
