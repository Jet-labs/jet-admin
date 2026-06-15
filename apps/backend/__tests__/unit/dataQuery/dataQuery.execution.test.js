const {
  createQueryEngine,
} = require('../../../utils/authorizedProxy');

describe('dataQuery execution', () => {
  it('creates a QueryEngine with provided fetchers', () => {
    const queryFetcher = jest.fn();
    const datasourceFetcher = jest.fn();
    const engine = createQueryEngine({ queryFetcher, datasourceFetcher });

    expect(engine.queryFetcher).toBe(queryFetcher);
    expect(engine.datasourceFetcher).toBe(datasourceFetcher);
  });
});