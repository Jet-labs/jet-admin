/**
 * Plugin-framework regression tests for the 10 new datasource types:
 * clickhouse, duckdb, prometheus, influxdb, filesystem, sftp,
 * github, gitlab, smtp, ldap.
 *
 * Covers registry wiring (all three plugin touchpoints), the engine cache
 * policy, pure helpers (CSV/line-protocol/jail/manifest parsing), and the
 * connection-test validators. Live-fixture execution lives in Docker QA.
 */

const TYPES = [
  "clickhouse",
  "duckdb",
  "prometheus",
  "influxdb",
  "filesystem",
  "sftp",
  "github",
  "gitlab",
  "smtp",
  "ldap",
];

describe("new datasource plugin wiring", () => {
  const { dataSourceRegistry, DATASOURCE_LOGIC_COMPONENTS } = require("@jet-admin/datasources-logic");
  const { DATASOURCE_TYPES } = require("@jet-admin/datasource-types");

  test.each(TYPES)("registry + forms exist for %s", (type) => {
    const DataSource = dataSourceRegistry.getDataSource(type);
    expect(typeof DataSource).toBe("function");

    const component = DATASOURCE_LOGIC_COMPONENTS[type];
    expect(component).toBeDefined();
    expect(typeof component.testConnection).toBe("function");
    expect(typeof component.getDatasourceInfo).toBe("function");

    const definition = Object.values(DATASOURCE_TYPES).find((t) => t.value === type);
    expect(definition).toBeDefined();
    expect(definition.formConfig.schema).toBeDefined();
    expect(definition.queryConfigForm.schema).toBeDefined();
  });

  test("unknown type still throws", () => {
    expect(() => dataSourceRegistry.getDataSource("not-a-type")).toThrow(
      "Unsupported data source: not-a-type"
    );
  });
});

describe("new datasource cache policy", () => {
  const { isQueryResultCacheable } = require("../../../modules/dataQuery/queryEngine/engine");

  test("SQL-like analytics types follow read-only rules", () => {
    expect(isQueryResultCacheable({ datasourceType: "clickhouse", dataQueryOptions: { query: "SELECT 1" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "clickhouse", dataQueryOptions: { query: "INSERT INTO t VALUES (1)" } })).toBe(false);
    expect(isQueryResultCacheable({ datasourceType: "duckdb", dataQueryOptions: { query: "SELECT 1 AS ok" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "duckdb", dataQueryOptions: { query: "DELETE FROM t" } })).toBe(false);
  });

  test("Prometheus reads are cacheable", () => {
    expect(isQueryResultCacheable({ datasourceType: "prometheus", dataQueryOptions: { operation: "instantQuery" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "prometheus", dataQueryOptions: { operation: "targets" } })).toBe(true);
  });

  test("InfluxDB caches Flux queries but never writes", () => {
    expect(isQueryResultCacheable({ datasourceType: "influxdb", dataQueryOptions: { operation: "query" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "influxdb", dataQueryOptions: { operation: "write" } })).toBe(false);
  });

  test("file datasources cache reads but never writes", () => {
    expect(isQueryResultCacheable({ datasourceType: "filesystem", dataQueryOptions: { operation: "read" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "filesystem", dataQueryOptions: { operation: "stat" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "sftp", dataQueryOptions: { operation: "list" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "sftp", dataQueryOptions: { operation: "write" } })).toBe(false);
  });

  test("code-hosting GETs are cacheable, mutations are not", () => {
    expect(isQueryResultCacheable({ datasourceType: "github", dataQueryOptions: { method: "GET" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "github", dataQueryOptions: { method: "POST" } })).toBe(false);
    expect(isQueryResultCacheable({ datasourceType: "gitlab", dataQueryOptions: { method: "GET" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "gitlab", dataQueryOptions: { method: "DELETE" } })).toBe(false);
  });

  test("LDAP search is cacheable; SMTP is never cacheable", () => {
    expect(isQueryResultCacheable({ datasourceType: "ldap", dataQueryOptions: { operation: "search" } })).toBe(true);
    expect(isQueryResultCacheable({ datasourceType: "ldap", dataQueryOptions: { operation: "bind" } })).toBe(false);
    expect(isQueryResultCacheable({ datasourceType: "smtp", dataQueryOptions: { operation: "send" } })).toBe(false);
    expect(isQueryResultCacheable({ datasourceType: "smtp", dataQueryOptions: { operation: "verify" } })).toBe(false);
  });
});

describe("pure helpers", () => {
  test("influxdb CSV + line protocol", () => {
    const { csvToObjects, toLineProtocol } = require("@jet-admin/datasources-logic");
    const rows = csvToObjects(',result,table,_time,_value,_field,_measurement\n,0,0,2026-01-01T00:00:00Z,42,usage,cpu\n');
    expect(rows).toEqual([expect.objectContaining({ _value: 42, _field: "usage" })]);

    const line = toLineProtocol({
      measurement: "cpu",
      tags: { host: "a" },
      fields: { usage: 42, label: 'x y' },
      timestamp: "2026-01-01T00:00:00Z",
    });
    expect(line).toContain("cpu,host=a");
    expect(line).toContain("usage=42");
    expect(line).toContain('label="x y"');
  });

  test("filesystem jail", () => {
    const { resolveInRoot } = require("@jet-admin/datasources-logic");
    expect(resolveInRoot("/data/exports", "a/b.txt")).toBe(require("path").resolve("/data/exports", "a/b.txt"));
    expect(() => resolveInRoot("/data/exports", "../secrets")).toThrow("escapes the configured root");
    expect(() => resolveInRoot("/data/exports", "/etc/passwd")).toThrow("escapes the configured root");
  });
});

describe("duckdb + filesystem live behavior (hermetic)", () => {
  const fs = require("fs");
  const os = require("os");
  const path = require("path");

  test("duckdb executes SELECT in memory", async () => {
    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const DuckDBDataSource = dataSourceRegistry.getDataSource("duckdb");
    const instance = new DuckDBDataSource({ datasourceID: "ds-duck", datasourceOptions: { databasePath: ":memory:" } });
    const rows = await instance.execute({ query: "SELECT 1 + 2 AS answer" });
    expect(rows).toEqual([{ answer: 3 }]);
  });

  test("duckdb rejects empty queries", async () => {
    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const DuckDBDataSource = dataSourceRegistry.getDataSource("duckdb");
    const instance = new DuckDBDataSource({ datasourceID: "ds-duck", datasourceOptions: { databasePath: ":memory:" } });
    await expect(instance.execute({ query: " " })).rejects.toThrow("DuckDB query is required");
  });

  test("filesystem lists/reads inside the root and rejects escapes", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "jafs-"));
    fs.writeFileSync(path.join(dir, "hello.txt"), "hello fs");
    try {
      const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
      const FileSystemDataSource = dataSourceRegistry.getDataSource("filesystem");
      const instance = new FileSystemDataSource({
        datasourceID: "ds-fs",
        datasourceOptions: { rootPath: dir, maxFileSize: 1024, maxEntries: 10 },
      });

      const list = await instance.execute({ operation: "list", path: "." });
      expect(list).toEqual([expect.objectContaining({ name: "hello.txt", type: "file" })]);

      const read = await instance.execute({ operation: "read", path: "hello.txt" });
      expect(read.content).toBe("hello fs");

      await expect(instance.execute({ operation: "read", path: "../outside" })).rejects.toThrow(
        "escapes the configured root"
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("HTTP datasource fetch contracts (mocked)", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test("clickhouse parses JSONEachRow and sends credentials as headers", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"a":1}\n{"a":2}\n'),
    });
    global.fetch = fetchMock;

    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const ClickHouseDataSource = dataSourceRegistry.getDataSource("clickhouse");
    const instance = new ClickHouseDataSource({
      datasourceID: "ds-ch",
      datasourceOptions: { host: "ch", port: 8123, username: "default", password: "secret", database: "db" },
    });

    const rows = await instance.execute({ query: "SELECT 1" });
    expect(rows).toEqual([{ a: 1 }, { a: 2 }]);
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["X-ClickHouse-User"]).toBe("default");
    expect(options.headers["X-ClickHouse-Key"]).toBe("secret");
    // Password must not appear in the URL.
    expect(describeUrl(fetchMock)).not.toContain("secret");
  });

  test("prometheus converts vector results to rows", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "success",
          data: {
            resultType: "vector",
            result: [{ metric: { __name__: "up", job: "node" }, value: [1700000000, "1"] }],
          },
        }),
    });

    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const PrometheusDataSource = dataSourceRegistry.getDataSource("prometheus");
    const instance = new PrometheusDataSource({
      datasourceID: "ds-prom",
      datasourceOptions: { baseUrl: "http://prom:9090" },
    });

    const rows = await instance.execute({ operation: "instantQuery", query: "up" });
    expect(rows).toEqual([expect.objectContaining({ metric: "up", job: "node", value: 1 })]);
  });

  test("github sends bearer token and returns JSON", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 1, title: "Bug" })),
    });
    global.fetch = fetchMock;

    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const GitHubDataSource = dataSourceRegistry.getDataSource("github");
    const instance = new GitHubDataSource({
      datasourceID: "ds-gh",
      datasourceOptions: { apiUrl: "https://api.github.com", token: "ghp_test" },
    });

    const result = await instance.execute({ method: "GET", path: "/repos/a/b/issues/1" });
    expect(result).toEqual({ id: 1, title: "Bug" });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer ghp_test");
  });

  test("gitlab uses PRIVATE-TOKEN header", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 7 })),
    });
    global.fetch = fetchMock;

    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const GitLabDataSource = dataSourceRegistry.getDataSource("gitlab");
    const instance = new GitLabDataSource({
      datasourceID: "ds-gl",
      datasourceOptions: { baseUrl: "https://gitlab.example.com/api/v4", authType: "privateToken", token: "glpat_test" },
    });

    await instance.execute({ method: "GET", path: "/user" });
    expect(fetchMock.mock.calls[0][1].headers["PRIVATE-TOKEN"]).toBe("glpat_test");
  });
});

describe("webhook listener guidance", () => {
  const { DATASOURCE_TYPES } = require("@jet-admin/datasource-types");
  const webhook = Object.values(DATASOURCE_TYPES).find((type) => type.value === "webhook");

  test("accepts array and scalar allowedMethods without throwing", () => {
    const arrayGuidance = webhook.listenerGuidance({
      tenantID: "tenant",
      listenerID: "listener",
      datasourceOptions: { allowedMethods: ["POST", "PUT"] },
    });
    expect(arrayGuidance.badges[0].label).toBe("Method: POST, PUT");

    const scalarGuidance = webhook.listenerGuidance({
      tenantID: "tenant",
      listenerID: "listener",
      datasourceOptions: { allowedMethods: "post" },
    });
    expect(scalarGuidance.badges[0].label).toBe("Method: POST");
  });
});

function describeUrl(fetchMock) {
  return String(fetchMock.mock.calls[0][0] || "");
}
