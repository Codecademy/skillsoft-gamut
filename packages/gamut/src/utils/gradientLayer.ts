/*
 * A brand gradient's circles are sized in `cqw` against the element's width.
 * An element can't be its own query container, so the element becomes one and
 * the gradient goes on a layer behind its content, over the flat `bg`
 * fallback (the sandbox's GradientLayer). Without it `cqw` falls back to the
 * viewport and the circles render page-sized.
 */
export const gradientLayer = ({ gradient }: { gradient?: string }) =>
  gradient
    ? {
        position: 'relative' as const,
        isolation: 'isolate' as const,
        containerType: 'inline-size' as const,
        '&::before': {
          content: '""',
          position: 'absolute' as const,
          inset: 0,
          zIndex: -1,
          borderRadius: 'inherit',
          backgroundImage: gradient,
        },
      }
    : {};
