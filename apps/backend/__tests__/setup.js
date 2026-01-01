/**
 * Global test setup for Jest
 * This file runs before each test file
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Mock the Logger to avoid cluttering test output
jest.mock('../utils/logger', () => ({
  log: jest.fn(),
}));

// Global test utilities
global.testUtils = {
  /**
   * Creates a mock Prisma client with common methods
   */
  createMockPrisma: () => ({
    tblUsers: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tblUsersTenantsRelationship: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    tblUserTenantRoleMappings: {
      findMany: jest.fn(),
    },
    tblUserTenantConfigMap: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    tblTenants: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    tblDataQueries: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tblWorkflows: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tblWorkflowRuns: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback()),
    $disconnect: jest.fn(),
  }),

  /**
   * Creates mock request object
   */
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),

  /**
   * Creates mock response object
   */
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },

  /**
   * Creates mock next function
   */
  createMockNext: () => jest.fn(),
};

// Extend Jest matchers if needed
expect.extend({
  /**
   * Custom matcher to check if a value is a valid UUID
   */
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`,
      pass,
    };
  },
});

// Cleanup after all tests
afterAll(async () => {
  // Add any global cleanup here
});
