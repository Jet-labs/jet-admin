/**
 * High-reasoning review findings: regression coverage for the hardening fixes.
 * Each block names the finding it pins.
 */

describe("cache misclassification (D: Flux to() / multi-statement SQL)", () => {
  const { isQueryResultCacheable } = require("../../../modules/dataQuery/queryEngine/engine");

  test("multi-statement SQL is never cacheable even when it starts with SELECT", () => {
    expect(
      isQueryResultCacheable({ datasourceType: "duckdb", dataQueryOptions: { query: "SELECT 1; INSERT INTO t VALUES (7)" } })
    ).toBe(false);
    expect(
      isQueryResultCacheable({ datasourceType: "clickhouse", dataQueryOptions: { query: "SELECT 1; DROP TABLE t" } })
    ).toBe(false);
    expect(
      isQueryResultCacheable({ datasourceType: "duckdb", dataQueryOptions: { query: "SELECT 'a;b' AS x" } })
    ).toBe(true);
  });

  test("Flux to() writes are not cacheable", () => {
    expect(
      isQueryResultCacheable({
        datasourceType: "influxdb",
        dataQueryOptions: { operation: "query", flux: 'from(bucket:"metrics") |> range(start: -1h) |> to(bucket:"x")' },
      })
    ).toBe(false);
    expect(
      isQueryResultCacheable({
        datasourceType: "influxdb",
        dataQueryOptions: { operation: "query", flux: 'from(bucket:"metrics") |> range(start: -1h)' },
      })
    ).toBe(true);
  });
});

describe("confined request SSRF guards", () => {
  const secretToken = { token: "ghp_secret", authType: "privateToken" };

  test("authority-changing paths stay confined and backslashes are rejected", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(JSON.stringify({ id: 1 })) });
    global.fetch = fetchMock;
    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");

    const GitHubDataSource = dataSourceRegistry.getDataSource("github");
    const instance = new GitHubDataSource({
      datasourceID: "ds-gh",
      datasourceOptions: { apiUrl: "https://api.github.com", token: "ghp_secret" },
    });

    // `//attacker.invalid/steal` must NOT move the request off the configured
    // host: it resolves to an in-origin path and keeps the token header.
    const result = await instance.execute({ method: "GET", path: "//attacker.invalid/steal" });
    expect(result).toEqual({ id: 1 });
    const calledUrl = describeUrl(fetchMock);
    expect(calledUrl.startsWith("https://api.github.com/")).toBe(true);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer ghp_secret");

    fetchMock.mockClear();
    await expect(instance.execute({ method: "GET", path: "/..\\..\\evil" })).rejects.toThrow(/backslash/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("cross-origin redirects are refused and tokens never leave the configured host", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 302,
        headers: { get: () => "https://attacker.invalid/steal" },
        text: () => Promise.resolve(""),
      });
    global.fetch = fetchMock;

    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const GitLabDataSource = dataSourceRegistry.getDataSource("gitlab");
    const instance = new GitLabDataSource({
      datasourceID: "ds-gl",
      datasourceOptions: { baseUrl: "https://gitlab.example.com/api/v4", authType: "privateToken", token: "glpat_secret" },
    });

    await expect(instance.execute({ method: "GET", path: "/user" })).rejects.toThrow(/foreign host|Redirect/);
    // The only fetch issued was to the configured host.
    expect(describeUrl(fetchMock)).toContain("gitlab.example.com");
  });

  test("GitLab paths resolve under the /api/v4 prefix", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("{}") });
    global.fetch = fetchMock;

    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const GitLabDataSource = dataSourceRegistry.getDataSource("gitlab");
    const instance = new GitLabDataSource({
      datasourceID: "ds-gl",
      datasourceOptions: { baseUrl: "https://gitlab.example.com/api/v4", authType: "privateToken", token: "glpat_secret" },
    });

    await instance.execute({ method: "GET", path: "/user" });
    expect(describeUrl(fetchMock)).toBe("https://gitlab.example.com/api/v4/user");
  });
});

describe("SMTP hardening", () => {
  test("object bodies are rejected (local file access)", async () => {
    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const SMTPDataSource = dataSourceRegistry.getDataSource("smtp");
    const instance = new SMTPDataSource({
      datasourceID: "ds-smtp",
      datasourceOptions: { host: "localhost", port: 587 },
    });

    await expect(
      instance.execute({ operation: "send", to: "a@example.com", subject: "x", text: { path: "/etc/passwd" } })
    ).rejects.toThrow("must be a string");

    await expect(
      instance.execute({ operation: "send", to: "a@example.com", subject: "x\nBCC: v@evil.com", text: "hi" })
    ).rejects.toThrow("must not contain line breaks");
  });
});

describe("InfluxDB line-protocol validation", () => {
  test("newlines and RFC3339 timestamps", () => {
    const { toLineProtocol, csvToObjects } = require("@jet-admin/datasources-logic");

    const line = toLineProtocol({
      measurement: "cpu",
      tags: { host: "a" },
      fields: { usage: 1 },
      timestamp: "2026-01-01T00:00:00Z",
    });
    expect(line).toContain(" 1767225600000000");

    expect(() =>
      toLineProtocol({ measurement: "cpu", tags: { host: "a\nx" }, fields: { usage: 1 } })
    ).toThrow("must not contain line breaks");

    expect(() =>
      toLineProtocol({ measurement: "cpu", fields: { usage: 1 }, timestamp: "0\ninjected value=2" })
    ).toThrow(/RFC3339|integer nanoseconds/);

    const multi = [
      '#group,false,false,true,true,false,false,true',
      '#datatype,string,long,string,double,string,string,string',
      '#default,_result,,_measurement,_value,_field,host',
      ',result,table,_measurement,_value,_field,host',
      ',,0,cpu,10,usage,a',
      '#group,false,false,true,true,false,false,true',
      '#datatype,string,long,string,double,string,string,string',
      '#default,_result,,_measurement,_value,_field,host',
      ',result,table,_measurement,_value,_field,host',
      ',,1,mem,20,used,b',
    ].join("\n") + "\n";

    const rows = csvToObjects(multi);
    expect(rows.length).toBe(2);
    expect(rows[0]).toEqual(expect.objectContaining({ _measurement: "cpu", _value: 10 }));
    expect(rows[1]).toEqual(expect.objectContaining({ _measurement: "mem", _value: 20 }));
  });
});

describe("Prometheus result conversion", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  async function instantQuery(data) {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ status: "success", data }) });
    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const PrometheusDataSource = dataSourceRegistry.getDataSource("prometheus");
    const instance = new PrometheusDataSource({
      datasourceID: "ds-prom",
      datasourceOptions: { baseUrl: "http://prom:9090" },
    });
    return instance.execute({ operation: "instantQuery", query: "up" });
  }

  test("scalar/string results are not empty", async () => {
    await expect(instantQuery({ resultType: "scalar", result: "42" })).resolves.toEqual([{ value: 42 }]);
    await expect(instantQuery({ resultType: "string", result: "hello" })).resolves.toEqual([{ value: "hello" }]);
  });

  test("labels named value/metric do not overwrite generated fields", async () => {
    const rows = await instantQuery({
      resultType: "vector",
      result: [{ metric: { __name__: "x", value: "999", metric: "evil" }, value: [1, "5"] }],
    });
    expect(rows).toEqual([expect.objectContaining({ metric: "x", value: 5 })]);
  });
});

describe("jail root normalization", () => {
  test("handling of /, ., and trailing slashes", () => {
    const { resolveInRoot } = require("@jet-admin/datasources-logic");
    const path = require("path");

    expect(resolveInRoot("/", "etc/passwd")).toBe(path.resolve("/etc/passwd"));
    expect(resolveInRoot("/data/exports/", "a.txt")).toBe(path.resolve("/data/exports", "a.txt"));
    expect(() => resolveInRoot("/data", "../evil")).toThrow("escapes");
  });
});

describe("LDAP filter validation", () => {
  test("rejects unbalanced/NUL filters", async () => {
    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const LDAPDataSource = dataSourceRegistry.getDataSource("ldap");
    const instance = new LDAPDataSource({
      datasourceID: "ds-ldap",
      datasourceOptions: { url: "ldap://127.0.0.1:389", searchBase: "dc=example,dc=com" },
    });

    await expect(instance.execute({ operation: "search", base: "dc=example,dc=com", filter: "(objectClass=person" })).rejects.toThrow(
      "unbalanced parentheses"
    );
    await expect(instance.execute({ operation: "search", base: "dc=example,dc=com", filter: "(\0)" })).rejects.toThrow("NUL");
  });
});

function describeUrl(fetchMock) {
  return String(fetchMock.mock.calls[0][0] || "");
}
