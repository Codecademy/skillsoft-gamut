module.exports = {
  extends: '../../babel.defaults.js',
  plugins: [
    [
      '@emotion/babel-plugin',
      {
        sourceMap: true,
        autoLabel: 'always',
        labelFormat: '[local]',
      },
    ],
  ],
};
