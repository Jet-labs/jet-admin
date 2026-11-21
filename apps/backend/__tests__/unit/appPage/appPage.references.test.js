const mockAssertTenantReferences = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../utils/tenantReference.util', () => ({
  assertTenantReferences: (...args) => mockAssertTenantReferences(...args),
}));

const { validateAppPageReferences } = require('../../../modules/appPage/appPage.references');

describe('validateAppPageReferences', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects a data source without a type even when queryID is present', async () => {
    await expect(validateAppPageReferences({
      tenantID: 'tenant-1',
      appPageConfig: { dataSources: [{ alias: 'orders', queryID: 'query-1' }] },
    })).rejects.toThrow("must declare type");
    expect(mockAssertTenantReferences).not.toHaveBeenCalled();
  });

  it('rejects a query source without queryID', async () => {
    await expect(validateAppPageReferences({
      tenantID: 'tenant-1',
      appPageConfig: { dataSources: [{ alias: 'orders', type: 'query' }] },
    })).rejects.toThrow("missing its queryID");
  });

  it('accepts a fully typed query source', async () => {
    await validateAppPageReferences({
      tenantID: 'tenant-1',
      appPageConfig: { dataSources: [{ alias: 'orders', type: 'query', queryID: 'query-1' }] },
    });
    expect(mockAssertTenantReferences).toHaveBeenCalledWith({
      tenantID: 'tenant-1', dataQueryIDs: ['query-1'], workflowIDs: [], listenerIDs: [],
    });
  });
});
