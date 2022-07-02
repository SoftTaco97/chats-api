/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/middleware/**/*.ts',
    'src/controllers/**/*.ts',
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
};
