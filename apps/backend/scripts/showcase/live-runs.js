/**
 * Read-only export of the latest completed live run per showcase workflow.
 * Usage: node scripts/showcase/live-runs.js --env ../../.env \
 *   --output ../../reports/qa/evidence/showcase-live-workflow-runs.json
 */
const fs = require("fs");
const { Client } = require("pg");
const dotenv = require("dotenv");
const { buildManifest } = require("./manifest");

const CUTOFF = new Date("2026-11-06T18:14:00.000Z");

function parseArgs() {
  const args = process.argv.slice(2);
  const value = (key) => {
    const index = args.indexOf(key);
    return index >= 0 ? args[index + 1] : undefined;
  };
  return { env: value("--env"), output: value("--output") };
}

(async () => {
  const args = parseArgs();
  if (!args.env || !args.output) throw new Error("--env and --output are required");
  const env = dotenv.parse(fs.readFileSync(args.env));
  const url = new URL(env.DATABASE_URL);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  const local = ["127.0.0.1", "localhost"].includes(url.hostname);
  const client = new Client({
    connectionString: url.toString(),
    ssl: local ? undefined : { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
    query_timeout: 20000,
  });
  const manifest = buildManifest();
  try {
    await client.connect();
    const runs = [];
    for (const workflow of manifest.workflows) {
      const instance = (
        await client.query(
          `SELECT "instanceID", status, "startedAt", "completedAt"
           FROM "tblWorkflowInstances"
           WHERE "tenantID"=$1 AND "workflowID"=$2 AND status='COMPLETED'
             AND "completedAt">=$3
           ORDER BY "completedAt" DESC LIMIT 1`,
          [manifest.tenantID, workflow.workflowID, CUTOFF]
        )
      ).rows[0];
      if (!instance) {
        runs.push({
          workflowID: workflow.workflowID,
          title: workflow.title,
          status: "MISSING",
        });
        continue;
      }
      const logs = await client.query(
        `SELECT count(*)::integer AS count FROM "tblWorkflowInstanceLogs" WHERE "instanceID"=$1`,
        [instance.instanceID]
      );
      runs.push({
        workflowID: workflow.workflowID,
        title: workflow.title,
        instanceID: instance.instanceID,
        status: instance.status,
        startedAt: instance.startedAt,
        completedAt: instance.completedAt,
        logEvents: logs.rows[0].count,
      });
    }
    const result = {
      mode: "live-workflow-runs",
      tenantID: manifest.tenantID,
      cutoff: CUTOFF.toISOString(),
      checkedAt: new Date().toISOString(),
      runs,
      summary: {
        total: runs.length,
        completed: runs.filter((r) => r.status === "COMPLETED").length,
        missing: runs.filter((r) => r.status !== "COMPLETED").length,
      },
    };
    fs.writeFileSync(args.output, `${JSON.stringify(result, null, 2)}\n`);
    console.log(JSON.stringify(result.summary));
    if (result.summary.missing > 0) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
})();
