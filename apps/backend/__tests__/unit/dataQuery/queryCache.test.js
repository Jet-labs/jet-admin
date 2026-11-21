const mockExecute = jest.fn();

jest.mock('@jet-admin/datasources-logic', () => ({
  dataSourceRegistry: {
    getDataSource: () => class MockDataSource {
      async execute(...args) { return mockExecute(...args); }
    },
  },
}));

const { QueryEngine } = require('../../../modules/dataQuery/queryEngine/engine');

function buildEngine(query) {
  const queryFetcher = jest.fn().mockResolvedValue({
    dataQueryID: 'q-1',
    tenantID: 'tenant-1',
    datasourceID: 'ds-1',
    datasourceType: query.datasourceType,
    updatedAt: '2026-01-01T00:00:00.000Z',
    dataQueryOptions: query.dataQueryOptions,
  });
  const datasourceFetcher = jest.fn().mockResolvedValue({ datasourceID: 'ds-1' });
  return new QueryEngine(queryFetcher, datasourceFetcher);
}

describe('QueryEngine result cache safety', () => {
  beforeEach(() => mockExecute.mockReset());

  it('executes an INSERT twice instead of serving a cached row', async () => {
    const engine = buildEngine({
      datasourceType: 'postgresql',
      dataQueryOptions: { query: 'INSERT INTO t (id) VALUES (1) RETURNING id' },
    });
    mockExecute.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([{ id: 2 }]);

    await expect(engine.executeQuery('q-1', {}, { tenantID: 'tenant-1' })).resolves.toEqual([{ id: 1 }]);
    await expect(engine.executeQuery('q-1', {}, { tenantID: 'tenant-1' })).resolves.toEqual([{ id: 2 }]);
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it('serves a repeated read-only SELECT from cache', async () => {
    const engine = buildEngine({
      datasourceType: 'postgresql',
      dataQueryOptions: { query: 'SELECT * FROM t' },
    });
    mockExecute.mockResolvedValue([{ id: 1 }]);

    await engine.executeQuery('q-1', {}, { tenantID: 'tenant-1' });
    await engine.executeQuery('q-1', {}, { tenantID: 'tenant-1' });
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('rejects unresolved/disallowed template roots before executing', async () => {
    const engine = buildEngine({
      datasourceType: 'postgresql',
      dataQueryOptions: { query: 'SELECT * FROM t WHERE id = {{args.id}}' },
    });

    await expect(engine.executeQuery('q-1', { id: 1 }, { tenantID: 'tenant-1' }))
      .rejects.toThrow('Query template validation failed');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
