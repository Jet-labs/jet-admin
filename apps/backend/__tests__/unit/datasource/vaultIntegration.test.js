/**
 * Unit tests for Datasource Service and Vault integration
 */

process.env.VAULT_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const { datasourceService } = require("../../../modules/datasource/datasource.service");
const { vaultService } = require("../../../modules/vault/vault.service");
const { DATASOURCE_LOGIC_COMPONENTS } = require("@jet-admin/datasources-logic");

jest.mock("../../../modules/vault/vault.service", () => ({
  vaultService: {
    getCredential: jest.fn(),
  },
}));

jest.mock("@jet-admin/datasources-logic", () => {
  const testConnectionMock = jest.fn();
  return {
    DATASOURCE_LOGIC_COMPONENTS: {
      googlesheets: {
        testConnection: testConnectionMock,
      },
    },
  };
});

describe("DatasourceService - Vault Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should pass the getCredential helper to testConnection", async () => {
    const tenantID = "tenant-uuid-128";
    const vaultCredentialID = "vault-credential-uuid-999";

    const datasourceOptions = {
      authType: "oauth2",
      oauth2: {
        vaultCredentialID,
      },
    };

    const mockDecryptedCreds = {
      refreshToken: "resolved-vault-refresh-token",
    };
    vaultService.getCredential.mockResolvedValue(mockDecryptedCreds);

    DATASOURCE_LOGIC_COMPONENTS.googlesheets.testConnection.mockImplementation(async ({ datasourceOptions, helpers }) => {
      // Execute the helper to simulate the Google Sheets / Firebase call
      const cred = await helpers.getCredential(vaultCredentialID);
      return { ok: true, status: 200, statusText: "Connected", credentialUsed: cred };
    });

    const result = await datasourceService.testDatasourceConnection({
      userID: "user-123",
      tenantID,
      datasourceType: "googlesheets",
      datasourceOptions,
    });

    expect(DATASOURCE_LOGIC_COMPONENTS.googlesheets.testConnection).toHaveBeenCalledTimes(1);
    
    // Check that getCredential helper was called with the correct tenantID and vaultCredentialID
    expect(vaultService.getCredential).toHaveBeenCalledWith({
      tenantID,
      vaultCredentialID,
    });

    expect(result).toEqual({
      ok: true,
      status: 200,
      statusText: "Connected",
      credentialUsed: mockDecryptedCreds,
    });
  });
});
