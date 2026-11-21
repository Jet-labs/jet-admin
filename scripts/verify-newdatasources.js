const { dataSourceRegistry, DATASOURCE_LOGIC_COMPONENTS } = require("@jet-admin/datasources-logic");

const results = [];
function record(name, ok, detail) {
  results.push({ name, result: ok ? "PASS" : "FAIL", detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name} :: ${detail}`);
}

async function testConnection(type, options) {
  const component = DATASOURCE_LOGIC_COMPONENTS[type];
  if (!component?.testConnection) throw new Error(`No testConnection for ${type}`);
  return component.testConnection({ datasourceOptions: options });
}

async function execute(type, dsOptions, queryOptions) {
  const DataSource = dataSourceRegistry.getDataSource(type);
  const instance = new DataSource({ datasourceID: `verify-${type}`, datasourceOptions: dsOptions });
  return instance.execute(queryOptions);
}

async function main() {
  // ClickHouse
  const ch = { protocol: "http", host: "localhost", port: 18123, username: "default", password: "jetpass", database: "default", timeout: 20 };
  record("clickhouse.test", (await testConnection("clickhouse", ch)).ok, "SELECT 1 probe");
  try {
    await execute("clickhouse", ch, { query: "DROP TABLE IF EXISTS jet_verify" });
    await execute("clickhouse", ch, { query: "CREATE TABLE jet_verify (n UInt64) ENGINE=Memory" });
    await execute("clickhouse", ch, { query: "INSERT INTO jet_verify VALUES (1), (2), (3)" });
    const rows = await execute("clickhouse", ch, { query: "SELECT sum(n) AS total FROM jet_verify" });
    record("clickhouse.exec", rows.length === 1 && Number(rows[0].total) === 6, `rows=${JSON.stringify(rows)}`);
  } catch (e) { record("clickhouse.exec", false, e.message); }

  // Prometheus
  const prom = { baseUrl: "http://localhost:19090", authType: "none", timeout: 20 };
  record("prometheus.test", (await testConnection("prometheus", prom)).ok, "buildinfo probe");
  try {
    const rows = await execute("prometheus", prom, { operation: "instantQuery", query: "prometheus_build_info" });
    record("prometheus.exec", Array.isArray(rows) && rows.length >= 1, `rows=${rows.length}`);
    const targets = await execute("prometheus", prom, { operation: "targets" });
    record("prometheus.targets", Array.isArray(targets), `targets=${targets.length}`);
  } catch (e) { record("prometheus.exec", false, e.message); }

  // InfluxDB
  const influx = { baseUrl: "http://localhost:18086", org: "jet-admin", bucket: "metrics", token: "influx-token-2026", timeout: 20 };
  record("influxdb.test", (await testConnection("influxdb", influx)).ok, "/health probe");
  try {
    const write = await execute("influxdb", influx, {
      operation: "write", measurement: "cpu", tags: { host: "verify" }, fields: { usage: 55 },
    });
    record("influxdb.write", write.success === true, JSON.stringify(write));
    const query = await execute("influxdb", influx, {
      operation: "query",
      flux: 'from(bucket: "metrics") |> range(start: -5m) |> filter(fn: (r) => r._measurement == "cpu")',
    });
    record("influxdb.exec", Array.isArray(query) && query.length >= 1, `rows=${query.length} sample=${JSON.stringify(query[0] || null)}`);
  } catch (e) { record("influxdb.exec", false, e.message); }

  // DuckDB
  const duck = { databasePath: ":memory:" };
  record("duckdb.test", (await testConnection("duckdb", duck)).ok, "SELECT 1 probe");
  try {
    const rows = await execute("duckdb", duck, { query: "SELECT 2 * 3 AS six UNION ALL SELECT 1 AS six" });
    record("duckdb.exec", rows.length === 2, `rows=${rows.length}`);
  } catch (e) { record("duckdb.exec", false, e.message); }

  // Filesystem (host temp root)
  const fs = require("fs");
  const os = require("os");
  const path = require("path");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jafs-live-"));
  fs.writeFileSync(path.join(tmp, "notes.txt"), "live fs notes");
  try {
    const fso = { rootPath: tmp, showHidden: false, maxFileSize: 1024, maxEntries: 10 };
    record("filesystem.test", (await testConnection("filesystem", fso)).ok, "root probe");
    const list = await execute("filesystem", fso, { operation: "list", path: "." });
    record("filesystem.exec", list.some((e) => e.name === "notes.txt"), `entries=${JSON.stringify(list)}`);
  } catch (e) { record("filesystem.exec", false, e.message); }
  finally { fs.rmSync(tmp, { recursive: true, force: true }); }

  // GitHub (public, no token)
  const gh = { apiUrl: "https://api.github.com", token: "", timeout: 20 };
  try {
    const t = await testConnection("github", gh);
    record("github.test", t.ok, "rate_limit probe");
    const repo = await execute("github", gh, { method: "GET", path: "/repos/octocat/Hello-World" });
    record("github.exec", repo && repo.full_name === "octocat/Hello-World", `repo=${repo && repo.full_name}`);
  } catch (e) { record("github.exec", false, e.message); }

  // GitLab (token required -> documented failure mode)
  const gl = { baseUrl: "https://gitlab.com/api/v4", authType: "privateToken", token: "", timeout: 20 };
  try {
    const t = await testConnection("gitlab", gl);
    record("gitlab.test-no-token", t.ok === false && /token is required/i.test(t.error || ""), `error=${t.error || "none"}`);
  } catch (e) { record("gitlab.test-no-token", /token is required/i.test(e.message), e.message); }

  // SMTP (Mailpit)
  const smtp = { host: "localhost", port: 1125, secure: false, requireTLS: false, timeout: 20 };
  try {
    const t = await testConnection("smtp", smtp);
    record("smtp.test", t.ok, "verify probe");
    const sent = await execute("smtp", smtp, {
      operation: "send", to: "team@example.com", subject: "Jet QA", text: "hello from jet-admin",
    });
    record("smtp.exec", sent.success === true, `messageId=${sent.messageId}`);
  } catch (e) { record("smtp.exec", false, e.message); }

  // LDAP (OpenLDAP fixture)
  const ldap = { url: "ldap://localhost:1389", bindDN: "cn=admin,dc=example,dc=com", password: "Admin2026", searchBase: "dc=example,dc=com", timeout: 20 };
  try {
    const t = await testConnection("ldap", ldap);
    record("ldap.test", t.ok, "bind probe");
    const entries = await execute("ldap", ldap, { operation: "search", base: "dc=example,dc=com", filter: "(objectClass=*)", scope: "sub", sizeLimit: 20 });
    record("ldap.exec", Array.isArray(entries) && entries.length >= 1, `entries=${entries.length}`);
  } catch (e) { record("ldap.exec", false, e.message); }

  // SFTP (OpenSSH fixture)
  const sftp = { host: "localhost", port: 1222, username: "jetqa", password: "JetPass2026", rootPath: "/config", timeout: 20 };
  try {
    const t = await testConnection("sftp", sftp);
    record("sftp.test", t.ok, "pwd probe");
    const write = await execute("sftp", sftp, { operation: "write", path: "jet-verify.txt", content: "hello sftp" });
    record("sftp.write", write.success === true, JSON.stringify(write));
    const list = await execute("sftp", sftp, { operation: "list", path: "." });
    record("sftp.exec", Array.isArray(list) && list.some((e) => e.name === "jet-verify.txt"), `entries=${list.length}`);
    const read = await execute("sftp", sftp, { operation: "read", path: "jet-verify.txt" });
    record("sftp.read", read.content === "hello sftp", `content=${read.content}`);
  } catch (e) { record("sftp.exec", false, e.message); }

  const passed = results.filter((r) => r.result === "PASS").length;
  console.log(`\nTOTAL: ${passed}/${results.length} passed`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => { console.error("FATAL", e); process.exit(2); });
