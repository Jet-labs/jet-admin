/**
 * Fast read-only verification of the showcase resources in the target DB.
 * Complements verify-stored.js (which also runs the local query/DSL runtime).
 * Usage:
 *   node scripts/showcase/verify-stored-counts.js --env ../../.env \
 *     --output ../../reports/qa/evidence/showcase-stored-counts.json \
 *     --baseline ../../reports/qa/evidence/showcase-production-baseline.json
 */
const fs = require("fs");
const { Client } = require("pg");
const dotenv = require("dotenv");
const { buildManifest } = require("./manifest");
const { validateManifest } = require("./validate");
const { digest, TABLES } = require("../seed-platform-showcase");

const RUNTIME_CUTOFF = new Date("2026-11-06T18:14:00.000Z");

function parseArgs() {
  const args = process.argv.slice(2);
  const value = (key) => {
    const index = args.indexOf(key);
    return index >= 0 ? args[index + 1] : undefined;
  };
  return {
    env: value("--env"),
    output: value("--output"),
    baseline: value("--baseline"),
  };
}

(async () => {
  const args = parseArgs();
  if (!args.env || !args.output) {
    throw new Error("--env and --output are required");
  }
  const env = dotenv.parse(fs.readFileSync(args.env));
  const url = new URL(env.DATABASE_URL);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  const local = ["127.0.0.1", "localhost"].includes(url.hostname);
  const client = new Client({
    connectionString: url.toString(),
    ssl: local ? undefined : { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
    statement_timeout: 20000,
    query_timeout: 25000,
  });

  const manifest = buildManifest();
  validateManifest(manifest);
  const checks = [];
  const check = (name, pass, detail) => {
    checks.push({ name, status: pass ? "PASS" : "FAIL", detail });
  };

  try {
    await client.connect();
    await client.query("BEGIN READ ONLY");

    for (const [collection, [table]] of Object.entries(TABLES)) {
      const expected = manifest[collection].length;
      const result = await client.query(
        `SELECT count(*)::integer AS count FROM "${table}" WHERE "tenantID"=$1`,
        [manifest.tenantID]
      );
      const actual = result.rows[0].count;
      check(`resource:${collection}`, actual === expected, { expected, actual });
    }

    const workflowIDs = manifest.workflows.map((w) => w.workflowID);
    const nodeCount = await client.query(
      'SELECT count(*)::integer AS count FROM "tblWorkflowNodes" WHERE "workflowID"=ANY($1::uuid[])',
      [workflowIDs]
    );
    const edgeCount = await client.query(
      'SELECT count(*)::integer AS count FROM "tblWorkflowEdge" WHERE "workflowID"=ANY($1::uuid[])',
      [workflowIDs]
    );
    const expectedNodes = manifest.workflows.reduce((n, w) => n + w.nodes.length, 0);
    const expectedEdges = manifest.workflows.reduce((n, w) => n + w.edges.length, 0);
    check("workflow:nodes", nodeCount.rows[0].count === expectedNodes, {
      expected: expectedNodes,
      actual: nodeCount.rows[0].count,
    });
    check("workflow:edges", edgeCount.rows[0].count === expectedEdges, {
      expected: expectedEdges,
      actual: edgeCount.rows[0].count,
    });

    const config = await client.query(
      'SELECT config FROM "tblUserTenantConfigMap" WHERE "tenantID"=$1 AND "userID"=$2',
      [manifest.tenantID, manifest.ownerID]
    );
    check(
      "seed:manifest-hash",
      config.rows[0]?.config?.showcaseManifestHash === digest(manifest),
      {
        expected: digest(manifest),
        actual: config.rows[0]?.config?.showcaseManifestHash || null,
      }
    );

    const events = manifest.workflows.find(
      (w) => w.workflowID === "001efddb-2fc1-4eb7-958d-6976e407dbf6"
    );
    const eventsNode = events.nodes.find(
      (n) => n.nodeID === "fbe8f9a8-0bb0-4432-ac57-4d1fbe5cd7b9"
    );
    const savedEventsNode = await client.query(
      'SELECT "nodeConfig" FROM "tblWorkflowNodes" WHERE "nodeID"=$1',
      [eventsNode.nodeID]
    );
    check(
      "seed:events-input-fallback",
      savedEventsNode.rows[0]?.nodeConfig?.code === eventsNode.nodeConfig.code,
      { matches: savedEventsNode.rows[0]?.nodeConfig?.code === eventsNode.nodeConfig.code }
    );

    const listeners = await client.query(
      'SELECT status, count(*)::integer AS count FROM "tblListeners" WHERE "tenantID"=$1 GROUP BY status ORDER BY status',
      [manifest.tenantID]
    );
    const cronJobs = await client.query(
      'SELECT "isDisabled", count(*)::integer AS count FROM "tblCronJobs" WHERE "tenantID"=$1 GROUP BY "isDisabled"',
      [manifest.tenantID]
    );
    const listenerActive = listeners.rows
      .filter((row) => row.status !== "inactive")
      .reduce((n, row) => n + row.count, 0);
    const cronActive = cronJobs.rows
      .filter((row) => row.isDisabled === false)
      .reduce((n, row) => n + row.count, 0);
    check("activation:listeners-inactive", listenerActive === 0, {
      statuses: listeners.rows,
    });
    check("activation:cron-disabled", cronActive === 0, {
      statuses: cronJobs.rows,
    });

    const completed = await client.query(
      `SELECT DISTINCT "workflowID" FROM "tblWorkflowInstances"
       WHERE "tenantID"=$1 AND status='COMPLETED' AND "completedAt">=$2`,
      [manifest.tenantID, RUNTIME_CUTOFF]
    );
    const completedIDs = new Set(completed.rows.map((row) => row.workflowID));
    const missing = workflowIDs.filter((id) => !completedIDs.has(id));
    check("runtime:all-workflows-completed", missing.length === 0, {
      completed: completedIDs.size,
      expected: workflowIDs.length,
      missing,
      cutoff: RUNTIME_CUTOFF.toISOString(),
    });

    if (args.baseline) {
      const baseline = JSON.parse(fs.readFileSync(args.baseline));
      const drift = [];
      for (const [collection, [table]] of Object.entries(TABLES)) {
        const rows = await client.query(
          `SELECT "tenantID", count(*)::integer AS count FROM "${table}"
           WHERE "tenantID"<>$1 GROUP BY "tenantID" ORDER BY "tenantID"`,
          [manifest.tenantID]
        );
        if (JSON.stringify(rows.rows) !== JSON.stringify(baseline.counts[collection])) {
          drift.push(collection);
        }
      }
      check("baseline:preexisting-tenants-unchanged", drift.length === 0, {
        changedCollections: drift,
      });
    }

    await client.query("ROLLBACK");

    const result = {
      mode: "stored-resource-count-verification",
      tenantID: manifest.tenantID,
      checkedAt: new Date().toISOString(),
      manifestHash: digest(manifest),
      checks,
      summary: {
        total: checks.length,
        passed: checks.filter((c) => c.status === "PASS").length,
        failed: checks.filter((c) => c.status === "FAIL").length,
      },
    };
    fs.writeFileSync(args.output, `${JSON.stringify(result, null, 2)}\n`);
    console.log(JSON.stringify(result.summary));
    if (result.summary.failed > 0) process.exitCode = 1;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
})();
