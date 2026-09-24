const shared = {
  '@codecademy/gamut': { singleton: true, requiredVersion: '^73.0.0' },
  '@codecademy/gamut-kit': { singleton: true },
};
export const config = { shared };
export const inline = {
  shared: {
    '@codecademy/gamut-kit': { eager: true },
    '@codecademy/gamut': { singleton: true },
  },
};
