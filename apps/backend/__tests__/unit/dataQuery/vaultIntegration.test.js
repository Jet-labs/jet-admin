/**
 * Unit tests for QueryEngine and Vault integration
 */

process.env.VAULT_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const { QueryEngine } = require("../../../modules/dataQuery/queryEngine/engine");
const { vaultService } = require("../../../modules/vault/vault.service");
const { dataSourceRegistry } = require("@jet-admin/datasources-logic");

jest.mock("../../../modules/vault/vault.service", () => ({
  vaultService: {
    getCredential: jest.fn(),
  },
}));

jest.mock("@jet-admin/datasources-logic", () => {
  const executeMock = jest.fn();
  class MockDataSource {
    constructor(config, helpers) {
      this.config = config;
      this.helpers = helpers;
    }
    async execute(resolvedTemplate, context, helpers) {
      return await executeMock(resolvedTemplate, context, helpers || this.helpers);
    }
  }

  return {
    dataSourceRegistry: {
      getDataSource: jest.fn().mockReturnValue(MockDataSource),
    },
    MockDataSourceExecute: executeMock,
  };
});

describe("QueryEngine - Vault Integration", () => {
  let queryEngine;
  let mockQueryFetcher;
  let mockDatasourceFetcher;
  const { MockDataSourceExecute } = require("@jet-admin/datasources-logic");

  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryFetcher = jest.fn();
    mockDatasourceFetcher = jest.fn();
    queryEngine = new QueryEngine(mockQueryFetcher, mockDatasourceFetcher);
  });

  it("should pass the getCredential helper to DataSource constructor and execute", async () => {
    const tenantID = "tenant-uuid-123";
    const vaultCredentialID = "vault-credential-uuid-456";

    const mockQuery = {
      dataQueryID: "query-123",
      tenantID,
      datasourceID: "ds-123",
      datasourceType: "googlesheets",
      dataQueryOptions: {
        spreadsheetId: "sheet-id-abc",
      },
    };

    const mockDatasourceConfig = {
      datasourceID: "ds-123",
      datasourceType: "googlesheets",
      tenantID,
      datasourceOptions: {
        authType: "oauth2",
        oauth2: {
          vaultCredentialID,
        },
      },
    };

    mockQueryFetcher.mockResolvedValue(mockQuery);
    mockDatasourceFetcher.mockResolvedValue(mockDatasourceConfig);

    const mockDecryptedCreds = {
      refreshToken: "resolved-vault-refresh-token",
    };
    vaultService.getCredential.mockResolvedValue(mockDecryptedCreds);

    MockDataSourceExecute.mockImplementation(async (resolvedTemplate, context, helpers) => {
      // Execute the helper to simulate the Google Sheets / Firebase call
      const cred = await helpers.getCredential(vaultCredentialID);
      return { success: true, credentialUsed: cred };
    });

    const result = await queryEngine.executeQuery("query-123", {});

    expect(mockQueryFetcher).toHaveBeenCalledWith("query-123");
    expect(mockDatasourceFetcher).toHaveBeenCalledWith("ds-123");
    expect(dataSourceRegistry.getDataSource).toHaveBeenCalledWith("googlesheets");

    expect(MockDataSourceExecute).toHaveBeenCalledTimes(1);
    
    // Check that getCredential helper was called with the correct tenantID and vaultCredentialID
    expect(vaultService.getCredential).toHaveBeenCalledWith({
      tenantID,
      vaultCredentialID,
    });

    expect(result).toEqual({
      success: true,
      credentialUsed: mockDecryptedCreds,
    });
  });
});
