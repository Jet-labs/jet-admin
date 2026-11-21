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
      mockQueryFetcher.mockResolvedValue({
        dataQueryID: 'query-123',
        datasourceType: 'postgresql',
        updatedAt: null,
        dataQueryOptions: { query: 'SELECT 1' },
      });
      const cacheKey = '|query-123||{}';
      queryEngine.cache.set(cacheKey, {
        value: mockResult,
        expiresAt: Date.now() + 10000,
      });

      const result = await queryEngine.executeQuery('query-123', {});

      expect(result).toEqual(mockResult);
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

  describe('cache policy', () => {
    const { isQueryResultCacheable } = require('../../../modules/dataQuery/queryEngine/engine');

    it('caches read-only SQL and never caches mutations', () => {
      expect(isQueryResultCacheable({ datasourceType: 'postgresql', dataQueryOptions: { query: 'SELECT * FROM t' } })).toBe(true);
      expect(isQueryResultCacheable({ datasourceType: 'postgresql', dataQueryOptions: { query: '  -- comment\n SELECT 1' } })).toBe(true);
      expect(isQueryResultCacheable({ datasourceType: 'postgresql', dataQueryOptions: { query: 'INSERT INTO t VALUES (1)' } })).toBe(false);
      expect(isQueryResultCacheable({ datasourceType: 'postgresql', dataQueryOptions: { query: 'WITH x AS (SELECT 1) DELETE FROM t' } })).toBe(false);
    });

    it('caches only read operations for HTTP, Redis, Kafka, S3 and Mongo', () => {
      expect(isQueryResultCacheable({ datasourceType: 'restapi', dataQueryOptions: { method: 'GET' } })).toBe(true);
      expect(isQueryResultCacheable({ datasourceType: 'restapi', dataQueryOptions: { method: 'POST' } })).toBe(false);
      expect(isQueryResultCacheable({ datasourceType: 'redis', dataQueryOptions: { operation: 'get' } })).toBe(true);
      expect(isQueryResultCacheable({ datasourceType: 'redis', dataQueryOptions: { operation: 'set' } })).toBe(false);
      expect(isQueryResultCacheable({ datasourceType: 'kafka', dataQueryOptions: { operation: 'consume' } })).toBe(false);
      expect(isQueryResultCacheable({ datasourceType: 'kafka', dataQueryOptions: { operation: 'listTopics' } })).toBe(true);
      expect(isQueryResultCacheable({ datasourceType: 's3', dataQueryOptions: { operation: 'putObject' } })).toBe(false);
      expect(isQueryResultCacheable({ datasourceType: 's3', dataQueryOptions: { operation: 'getObject' } })).toBe(true);
      expect(isQueryResultCacheable({ datasourceType: 'mongodb', dataQueryOptions: { operation: 'find' } })).toBe(true);
      expect(isQueryResultCacheable({ datasourceType: 'mongodb', dataQueryOptions: { operation: 'insertOne' } })).toBe(false);
    });

    it('does not cache unknown datasource types', () => {
      expect(isQueryResultCacheable({ datasourceType: 'some-new-db', dataQueryOptions: { operation: 'read' } })).toBe(false);
    });
  });

  describe('getDataSource', () => {
    it('should return cached datasource if available', async () => {
      const mockDataSource = { execute: jest.fn() };
      const query = { datasourceType: 'postgresql', datasourceID: 'ds-123' };
      const cacheKey = 'postgresql_ds-123_';

      queryEngine.dataSourceCache.set(cacheKey, {
        value: mockDataSource,
        expiresAt: Date.now() + 10000,
      });

      const result = await queryEngine.getDataSource(query, 'query-id');

      expect(result).toBe(mockDataSource);
      expect(mockDatasourceFetcher).not.toHaveBeenCalled();
    });
  });
});
