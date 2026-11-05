/** @jest-config-loader ts-node */
/* eslint-disable */
import path from 'path';
import base from '../../jest.config.base';

export default base('gamut-brand', {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'babel-jest',
      {
        configFile: require.resolve(path.join(__dirname, './babel.config.js')),
      },
    ],
  },
  setupFiles: [],
  setupFilesAfterEnv: [],
  moduleFileExtensions: ['ts', 'js', 'json'],
});
