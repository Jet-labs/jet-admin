/**
 * jest.config.js — Test configuration for @jet-admin/expression-engine.
 *
 * Uses esbuild transform for fast ESM→CJS transpilation in tests.
 */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.test.js"],
  transform: {
    "^.+\\.js$": ["esbuild-jest", { sourcemap: true }],
  },
  transformIgnorePatterns: [],
};
