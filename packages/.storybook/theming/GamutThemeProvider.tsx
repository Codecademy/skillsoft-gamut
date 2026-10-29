import { useLayoutEffect, useRef } from 'react';
import {
  Background,
  corePalette,
  ColorModes,
  GamutProvider,
  coreTheme,
  adminTheme,
  lxStudioTheme,
  percipioTheme,
  platformTheme,
  skillsoftTheme,
  originalCodecademyTheme,
} from '@skillsoft/gamut-styles';
import { Theme } from '@emotion/react';
import tokensCss from '@skillsoft/gamut-styles/tokens.css?inline';

const STORYBOOK_CSP_NONCE = 'storybook-csp-nonce';

/**
 * Story functions must be called as a regular function to avoid full-remounts
 * See: https://github.com/storybookjs/storybook/issues/12255
 */

const themeBackground: Record<ColorModes, 'white' | 'navy'> = {
  light: 'white',
  dark: 'navy',
};

const themeMap = {
  core: coreTheme,
  admin: adminTheme,
  lxStudio: lxStudioTheme,
  percipio: percipioTheme,
  platform: platformTheme,
  skillsoft: skillsoftTheme,
  originalCodecademy: originalCodecademyTheme,
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
  const currentTheme = themeMap[selectedTheme];
  /*
   * Generated themes (color-system spike; they carry contentModes) take their
   * values from tokens.css, not Emotion. Injected only for those: tokens.css
   * also sets white, black and background-current on :root, which would leak
   * into the other themes. They have none of core's primitives, so `navy`
   * doesn't exist there; the story sits on their own surface-default.
   */
  const generated = 'contentModes' in currentTheme ? currentTheme : undefined;
  const tokens = generated && <style>{tokensCss}</style>;
  const bg = (
    generated
      ? generated.modes[colorMode]['surface-default']
      : themeBackground[colorMode]
  ) as 'white';
  const background = generated
    ? (generated._tokens.colors as Record<string, string>)[bg]
    : corePalette[themeBackground[colorMode]];
  const storyRef = useRef<HTMLDivElement>(null);

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
        {tokens}
        <Background alwaysSetVariables bg={bg} ref={storyRef}>
          {Story()}
        </Background>
      </GamutProvider>
    );
  }

  // Wrap all stories in minimal provider
  return (
    <GamutProvider
      useLogicalProperties={useLogicalProperties}
      theme={currentTheme as unknown as Theme}
    >
      <Background alwaysSetVariables bg={bg} ref={storyRef}>
        {Story()}
      </Background>
    </GamutProvider>
  );
};
