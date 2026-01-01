module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'modules/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  // Clear mocks between tests
  clearMocks: true,
  // Restore mocks after each test
  restoreMocks: true,
};
