/** Jest for pure frontend logic (reducer, expression evaluation).
 * Uses esbuild-jest (already hoisted at the repo root) so ESM `src` files
 * run without a babel setup. No jsdom: these suites cover pure logic only.
 * Run from the repo root:
 *   .\node_modules\.bin\jest --config apps/frontend/jest.config.js
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
