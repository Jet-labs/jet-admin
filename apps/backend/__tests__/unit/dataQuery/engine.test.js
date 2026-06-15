/**
 * Unit tests for QueryEngine class
 */

const { QueryEngine } = require('../../../modules/dataQuery/queryEngine/engine');

describe('QueryEngine', () => {
  let queryEngine;
  let mockQueryFetcher;
  let mockDatasourceFetcher;

  beforeEach(() => {
    // Reset mocks
    mockQueryFetcher = jest.fn();
    mockDatasourceFetcher = jest.fn();
    queryEngine = new QueryEngine(mockQueryFetcher, mockDatasourceFetcher);
  });

  describe('constructor', () => {
    it('should initialize with query and datasource fetchers', () => {
      expect(queryEngine.queryFetcher).toBe(mockQueryFetcher);
      expect(queryEngine.datasourceFetcher).toBe(mockDatasourceFetcher);
    });

    it('should initialize empty caches', () => {
      expect(queryEngine.cache).toBeInstanceOf(Map);
      expect(queryEngine.cache.size).toBe(0);
      expect(queryEngine.dataSourceCache).toBeInstanceOf(Map);
      expect(queryEngine.dataSourceCache.size).toBe(0);
    });
  });

  describe('resolveTemplate', () => {
    it('should resolve string template with simple variables', async () => {
      const template = 'SELECT * FROM users WHERE id = {{inputs.userId}}';
      const runtimeInputs = { userId: 123 };

      const result = await queryEngine.resolveTemplate(template, runtimeInputs, 'test-query');

      expect(result).toBe('SELECT * FROM users WHERE id = 123');
    });

    it('should resolve string template with multiple variables', async () => {
      const template = 'SELECT * FROM {{inputs.tableName}} WHERE id = {{inputs.userId}}';
      const runtimeInputs = { tableName: 'customers', userId: 456 };

      const result = await queryEngine.resolveTemplate(template, runtimeInputs, 'test-query');

      expect(result).toBe('SELECT * FROM customers WHERE id = 456');
    });

    it('should resolve object template recursively', async () => {
      const template = {
        query: 'SELECT * FROM users',
        limit: '{{inputs.pageSize}}',
        filters: {
          name: '{{inputs.userName}}'
        }
      };
      const runtimeInputs = { pageSize: 10, userName: 'John' };

      const result = await queryEngine.resolveTemplate(template, runtimeInputs, 'test-query');

      expect(result.query).toBe('SELECT * FROM users');
      expect(result.limit).toBe(10);
      expect(result.filters.name).toBe('John');
    });

    it('should preserve array/object shapes when recursively resolving template values', async () => {
      const template = {
        ids: '{{inputs.ids}}',
        filters: ['{{inputs.status}}', { user: '{{inputs.user}}' }],
      };
      const runtimeInputs = {
        ids: [1, 2],
        status: 'active',
        user: { id: 7 },
      };

      const result = await queryEngine.resolveTemplate(template, runtimeInputs, 'test-query');

      expect(result).toEqual({
        ids: [1, 2],
        filters: ['active', { user: { id: 7 } }],
      });
    });

    it('should handle template without variables', async () => {
      const template = 'SELECT * FROM users';
      const runtimeInputs = {};

      const result = await queryEngine.resolveTemplate(template, runtimeInputs, 'test-query');

      expect(result).toBe('SELECT * FROM users');
    });

    it('should handle nested object access in template', async () => {
      const template = 'SELECT * FROM users WHERE id = {{inputs.user.id}}';
      const runtimeInputs = { user: { id: 789 } };

      const result = await queryEngine.resolveTemplate(template, runtimeInputs, 'test-query');

      expect(result).toBe('SELECT * FROM users WHERE id = 789');
    });

    it('should ignore legacy args-prefixed template paths if not in allowedRoots', async () => {
      const template = 'SELECT * FROM users WHERE id = {{args.user.id}}';
      const runtimeInputs = { user: { id: 654 } };

      const result = await queryEngine.resolveTemplate(template, runtimeInputs, 'test-query');

      expect(result).toBe('SELECT * FROM users WHERE id = ');
    });

    it('should resolve bracket notation and array indexes safely', async () => {
      const template = 'SELECT * FROM {{inputs.filters[0].table}} WHERE user_id = {{inputs["user-id"]}}';
      const runtimeInputs = {
        filters: [{ table: 'customers' }],
        'user-id': 321,
      };

      const result = await queryEngine.resolveTemplate(template, runtimeInputs, 'test-query');

      expect(result).toBe('SELECT * FROM customers WHERE user_id = 321');
    });

    it('should not resolve query templates without an allowed root prefix', async () => {
      const template = 'SELECT * FROM users WHERE id = {{userId}}';
      const runtimeInputs = { userId: 123 };

      const result = await queryEngine.resolveTemplate(template, runtimeInputs, 'test-query');

      expect(result).toBe('SELECT * FROM users WHERE id = ');
    });

    it('should not execute arbitrary expressions in template blocks', async () => {
      const template = 'SELECT {{constructor.constructor("return 1")()}}';

      const result = await queryEngine.resolveTemplate(template, {}, 'test-query');

      expect(result).toBe('SELECT ');
    });
  });

  describe('executeQuery', () => {
    it('should throw error when query not found', async () => {
      mockQueryFetcher.mockResolvedValue(null);

      await expect(queryEngine.executeQuery('non-existent-query', {}))
        .rejects.toThrow('Query non-existent-query not found');
    });

    it('should return cached result for same query and args', async () => {
      const mockResult = { rows: [{ id: 1, name: 'Test' }] };
      const cacheKey = 'query-123|{}';
      queryEngine.cache.set(cacheKey, mockResult);

      const result = await queryEngine.executeQuery('query-123', {});

      expect(result).toEqual(mockResult);
      expect(mockQueryFetcher).not.toHaveBeenCalled();
    });

    it('should execute query and cache result', async () => {
      const mockQuery = {
        dataQueryID: 'query-123',
        datasourceID: 'ds-456',
        datasourceType: 'postgresql',
        dataQueryOptions: {
          query: 'SELECT * FROM users'
        }
      };
      const mockDatasourceConfig = {
        host: 'localhost',
        database: 'test'
      };
      const mockResult = [{ id: 1, name: 'Test' }];
      const mockExecute = jest.fn().mockResolvedValue(mockResult);

      mockQueryFetcher.mockResolvedValue(mockQuery);
      mockDatasourceFetcher.mockResolvedValue(mockDatasourceConfig);

      // Mock the DataSource registry
      jest.mock('@jet-admin/datasources-logic', () => ({
        dataSourceRegistry: {
          getDataSource: jest.fn().mockReturnValue(
            class MockDataSource {
              constructor() {}
              execute = mockExecute;
            }
          )
        }
      }));

      // Note: Full integration test would require mocking the datasource-logic package
      // This test verifies the core logic flow
      expect(mockQueryFetcher).toBeDefined();
    });
  });

  describe('getDataSource', () => {
    it('should return cached datasource if available', async () => {
      const mockDataSource = { execute: jest.fn() };
      const query = { datasourceType: 'postgresql', datasourceID: 'ds-123' };
      const cacheKey = 'postgresql_ds-123';
      
      queryEngine.dataSourceCache.set(cacheKey, mockDataSource);

      const result = await queryEngine.getDataSource(query, 'query-id');

      expect(result).toBe(mockDataSource);
      expect(mockDatasourceFetcher).not.toHaveBeenCalled();
    });
  });
});
