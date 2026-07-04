/**
 * Unit tests for Datasource Connection testing across listener and database datasources
 */

process.env.VAULT_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const { datasourceService } = require("../../../modules/datasource/datasource.service");

describe("DatasourceService - Connection Tests", () => {
  const listenerTypes = ["webhook", "mqtt", "websocket", "sse", "syslog", "nats"];

  listenerTypes.forEach((dsType) => {
    it(`should successfully test connection for '${dsType}' listener datasource`, async () => {
      const result = await datasourceService.testDatasourceConnection({
        userID: "user-123",
        tenantID: "tenant-123",
        datasourceType: dsType,
        datasourceOptions: { connectionName: `test_${dsType}` },
      });

      expect(result).toBeDefined();
      expect(result.ok || result.success).toBe(true);
    });
  });

  it("should throw error for unsupported datasource type", async () => {
    await expect(
      datasourceService.testDatasourceConnection({
        userID: "user-123",
        tenantID: "tenant-123",
        datasourceType: "invalid_type",
        datasourceOptions: {},
      })
    ).rejects.toThrow("Connection test for datasource type 'invalid_type' is not supported.");
  });
});
