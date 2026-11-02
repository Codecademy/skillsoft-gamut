/** @jest-config-loader ts-node */
/* eslint-disable */
import base from '../../jest.config.base';

export default base('gamut-codemods', {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  /* Fixtures are inputs, not tests, and may be deliberately odd code. */
  testPathIgnorePatterns: ['node_modules', 'dist', '__testfixtures__'],
  setupFiles: [],
  setupFilesAfterEnv: [],
});
