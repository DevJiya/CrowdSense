/**
 * @module JestConfig
 * @description Configuration for Jest testing framework.
 * Enforces coverage thresholds and sets up global mocks.
 */

export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterFramework: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/index.js',
    '!src/data/**',
    '!src/services/dijkstraEngine.js',
    '!src/**/index.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  forceExit: true,
};
