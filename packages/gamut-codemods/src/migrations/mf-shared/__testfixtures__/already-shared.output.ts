const shared = {
  '@codecademy/gamut': { singleton: true, requiredVersion: '^73.0.0' },
  '@codecademy/gamut-icons': { singleton: true },
  '@codecademy/gamut-illustrations': { singleton: true },
  '@codecademy/gamut-patterns': { singleton: true },
  '@codecademy/gamut-styles': { singleton: true },
  '@codecademy/variance': { singleton: true },
};
export const config = { shared };
export const inline = {
  shared: {
    '@codecademy/gamut-icons': { eager: true },
    '@codecademy/gamut-illustrations': { eager: true },
    '@codecademy/gamut-patterns': { eager: true },
    '@codecademy/gamut-styles': { eager: true },
    '@codecademy/variance': { eager: true },
    '@codecademy/gamut': { singleton: true },
  },
};
