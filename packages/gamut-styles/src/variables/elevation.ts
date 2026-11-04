type ThemeColors = Record<string, string>;

export type ElevationStateStyles = {
  shadow: string;
  transform: string;
};

export type ElevationScale = {
  rest: ElevationStateStyles;
  hover: ElevationStateStyles;
  hoverMirrored: ElevationStateStyles;
};

export type ElevationState = keyof ElevationScale;

export type ElevationScaleFactory = (theme: {
  colors: ThemeColors;
}) => ElevationScale;

export const coreElevation: ElevationScaleFactory = ({ colors }) => {
  const shadowPrimary = colors['shadow-primary'];
  const offset = 8;
  const lift = 4;
  const shadow = (x: number) => `${x}px ${offset}px 0 0 ${shadowPrimary}`;

  return {
    rest: { shadow: `0 0 0 0 ${shadowPrimary}`, transform: 'none' },
    hover: {
      shadow: shadow(-offset),
      transform: `translate(${lift}px, -${lift}px)`,
    },
    hoverMirrored: {
      shadow: shadow(offset),
      transform: `translate(-${lift}px, -${lift}px)`,
    },
  };
};

export const percipioElevation: ElevationScaleFactory = ({ colors }) => {
  const shadowPrimary = colors['shadow-primary'];
  const shadowSecondary = colors['shadow-secondary'];
  const hover = `0 1px 4px 0 ${shadowPrimary}, 0 2px 11px 0 ${shadowSecondary}`;

  return {
    rest: {
      shadow: `0 1px 4px 0 ${shadowPrimary}, 0 2px 7px 0 ${shadowPrimary}`,
      transform: 'none',
    },
    hover: { shadow: hover, transform: 'none' },
    hoverMirrored: { shadow: hover, transform: 'none' },
  };
};

/*
 * Brand elevations, drawn in the shadow roles (sandbox df33b47). Every depth
 * composes `shadow-key` (the tight contact layer) and `shadow-ambient` (the
 * soft falloff), so the layer count is the same at every level and shadows
 * animate cleanly between them. Geometry lives here until elevation becomes
 * CSS variables; the colors are already role names.
 */
const layers = (colors: ThemeColors, key: string, ambient: string): string =>
  `${key} ${colors['shadow-key']}, ${ambient} ${colors['shadow-ambient']}`;

/* The soft raised shadow: design's Card geometry at rest and on hover. */
export const softElevation: ElevationScaleFactory = ({ colors }) => {
  const hover = layers(colors, '0 2px 6px 0', '0 6px 16px 0');
  return {
    rest: {
      shadow: layers(colors, '0 1px 4px 0', '0 2px 7px 0'),
      transform: 'none',
    },
    hover: { shadow: hover, transform: 'none' },
    hoverMirrored: { shadow: hover, transform: 'none' },
  };
};

/*
 * The hard offset, for the Codecademy theme only, drawn in `shadow-key`. The
 * brand makes `shadow-ambient` transparent, and the ambient layer stays at
 * zero size. Design gives this theme "the hard offset" at raised depth
 * (sandbox df33b47, CTAButton) without its geometry, so raised is old core's
 * CTAButton offset at rest (-4px) and raised-hover its hover offset (-8px,
 * with old core's Card lift).
 */
export const offsetElevation: ElevationScaleFactory = ({ colors }) => {
  const raised = 4;
  const hover = 8;
  const lift = 4;
  const none = '0 0 0 0';
  return {
    rest: {
      shadow: layers(colors, `-${raised}px ${raised}px 0 0`, none),
      transform: 'none',
    },
    hover: {
      shadow: layers(colors, `-${hover}px ${hover}px 0 0`, none),
      transform: `translate(${lift}px, -${lift}px)`,
    },
    hoverMirrored: {
      shadow: layers(colors, `${hover}px ${hover}px 0 0`, none),
      transform: `translate(-${lift}px, -${lift}px)`,
    },
  };
};
