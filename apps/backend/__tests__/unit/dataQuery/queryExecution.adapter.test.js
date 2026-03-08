const {
  createQueryEngine,
  buildDataQueryExecutionArgs,
  executeDataQuery,
} = require('../../../modules/dataQuery/queryEngine/queryExecution.adapter');

describe('queryExecution.adapter', () => {
  it('creates a QueryEngine with provided fetchers', () => {
    const queryFetcher = jest.fn();
    const datasourceFetcher = jest.fn();
    const engine = createQueryEngine({ queryFetcher, datasourceFetcher });

    expect(engine.queryFetcher).toBe(queryFetcher);
    expect(engine.datasourceFetcher).toBe(datasourceFetcher);
  });

  it('builds runtime args from arg definitions and values', () => {
    const result = buildDataQueryExecutionArgs(
      [
        { key: 'customerID', type: 'number' },
        { key: 'status', type: 'string' },
      ],
      { customerID: 42, status: 'ACTIVE' }
    );

    expect(result.mappedArgsToValues).toEqual([
      { key: 'customerID', type: 'number', value: 42 },
      { key: 'status', type: 'string', value: 'ACTIVE' },
    ]);
    expect(result.kvtObject).toEqual({
      customerID: 42,
      status: 'ACTIVE',
    });
  });

  it('executes a query using precomputed execution args', async () => {
    const engine = {
      executeQuery: jest.fn().mockResolvedValue({ rows: [] }),
    };

    const result = await executeDataQuery({
      engine,
      dataQueryID: 'query-1',
      executionArgs: { customerID: 42 },
    });

    expect(engine.executeQuery).toHaveBeenCalledWith('query-1', { customerID: 42 });
    expect(result).toEqual({ rows: [] });
  });
});