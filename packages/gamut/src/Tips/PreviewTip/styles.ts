const shadowAlignment = '-8px';

export const avatarGridTemplate = `'avatar 1fr'`;

export const avatarColumnTemplate = 'min-content 1fr';

export const defaultGridTemplate = `1fr`;

export const getShadowAlignment = (alignment: string) => {
  const topAligned = alignment.includes('top');
  const startAligned = alignment.includes('start');

  return {
    bottom: !topAligned ? shadowAlignment : undefined,
    left: startAligned ? shadowAlignment : undefined,
    right: !startAligned ? shadowAlignment : undefined,
    top: topAligned ? shadowAlignment : undefined,
  };
};
