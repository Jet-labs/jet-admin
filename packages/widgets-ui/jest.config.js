/** Jest transform for pure widget modules (spec generator/parser).
 * Existing tests require the built CJS bundle; these new suites import ESM
 * sources directly via esbuild-jest (hoisted at the repo root).
 * Run from the repo root:
 *   .\node_modules\.bin\jest --config packages/widgets-ui/jest.config.js
 */
module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.jsx?$': ['esbuild-jest', { loader: 'js', target: 'es2020' }],
  },
  transformIgnorePatterns: [],
};
