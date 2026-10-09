export default {
  plugins: [
    new ModuleFederationPlugin({
      shared: {
        react: { singleton: true },
        '@codecademy/gamut-kit': { singleton: true },
        '@emotion/react': { singleton: true },
      },
    }),
  ],
};
