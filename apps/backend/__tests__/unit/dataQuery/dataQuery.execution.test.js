const {
  createQueryEngine,
  buildDataQueryExecutionInputs,
  executeDataQuery,
  defaultDatasourceFetcher,
} = require('../../../modules/dataQuery/dataQuery.service');

describe('dataQuery execution', () => {
  it('creates a QueryEngine with provided fetchers', () => {
    const queryFetcher = jest.fn();
    const datasourceFetcher = jest.fn();
    const engine = createQueryEngine({ queryFetcher, datasourceFetcher });

    expect(engine.queryFetcher).toBe(queryFetcher);
    expect(engine.datasourceFetcher).toBe(datasourceFetcher);
  });

  it('builds runtime inputs from input definitions and values', () => {
    const result = buildDataQueryExecutionInputs(
      [
        { key: 'customerID', type: 'number' },
        { key: 'status', type: 'string' },
      ],
      { customerID: 42, status: 'ACTIVE' }
    );

    expect(result.mappedInputsToValues).toEqual([
      { key: 'customerID', type: 'number', value: 42 },
      { key: 'status', type: 'string', value: 'ACTIVE' },
    ]);
    expect(result.kvtObject).toEqual({
      customerID: 42,
      status: 'ACTIVE',
    });
  });

  it('executes a query using precomputed execution inputs', async () => {
    const engine = {
      executeQuery: jest.fn().mockResolvedValue({ rows: [] }),
    };

    const result = await executeDataQuery({
      engine,
      dataQueryID: 'query-1',
      executionInputs: { customerID: 42 },
    });

    expect(engine.executeQuery).toHaveBeenCalledWith('query-1', { customerID: 42 });
    expect(result).toEqual({ rows: [] });
  });
});