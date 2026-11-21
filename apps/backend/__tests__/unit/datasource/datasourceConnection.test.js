/**
 * Unit tests for Datasource Connection testing across listener and database datasources
 */

process.env.VAULT_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const { datasourceService } = require("../../../modules/datasource/datasource.service");
const { buildPostgresClientConfig } = require("@jet-admin/datasources-logic");

describe("PostgreSQL configuration normalization", () => {
  it("maps connectionDetails (the UI form shape) into pg options", () => {
    const config = buildPostgresClientConfig({
      connectionOption: "connectionDetails",
      connectionDetails: {
        host: "postgres",
        port: 5432,
        database: "qa",
        user: "postgres",
        password: "secret",
        sslMode: "disable",
      },
      connectionString: "",
    });
    expect(config).toMatchObject({
      host: "postgres",
      port: 5432,
      database: "qa",
      user: "postgres",
      password: "secret",
    });
    expect(config.ssl).toBeUndefined();
  });

  it("uses connectionString when that option is selected", () => {
    expect(buildPostgresClientConfig({
      connectionOption: "connectionString",
      connectionString: "postgresql://u:p@db:5432/app",
      connectionDetails: { host: "ignored" },
    })).toEqual({ connectionString: "postgresql://u:p@db:5432/app" });
  });

  it("keeps legacy connectionData support", () => {
    const config = buildPostgresClientConfig({
      connectionData: { host: "legacy", database: "db", user: "u", password: "p" },
    });
    expect(config.host).toBe("legacy");
  });
});


describe("DatasourceService - Connection Tests", () => {
  const networkListenerTypes = ["mqtt", "websocket", "sse", "syslog", "nats"];

  networkListenerTypes.forEach((dsType) => {
    it(`should reject '${dsType}' without a usable endpoint`, async () => {
      await expect(
        datasourceService.testDatasourceConnection({
          userID: "user-123",
          tenantID: "tenant-123",
          datasourceType: dsType,
          datasourceOptions: { connectionName: `test_${dsType}` },
        })
      ).rejects.toThrow();
    });
  });

  it("should accept a webhook with valid passive ingress configuration", async () => {
    const result = await datasourceService.testDatasourceConnection({
      userID: "user-123",
      tenantID: "tenant-123",
      datasourceType: "webhook",
      datasourceOptions: { connectionName: "test_webhook", allowedMethods: ["POST"], pathSuffix: "qa" },
    });
    expect(result.ok).toBe(true);
    expect(result.passive).toBe(true);
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
