export default {
  plugins: [
    new ModuleFederationPlugin({
      shared: {
        react: { singleton: true },
        '@codecademy/gamut': { singleton: true },
        '@codecademy/gamut-icons': { singleton: true },
        '@codecademy/gamut-illustrations': { singleton: true },
        '@codecademy/gamut-patterns': { singleton: true },
        '@codecademy/gamut-styles': { singleton: true },
        '@codecademy/variance': { singleton: true },
        '@emotion/react': { singleton: true },
      },
    }),
  ],
};
