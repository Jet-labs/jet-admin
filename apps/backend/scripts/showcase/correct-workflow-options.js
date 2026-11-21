/**
 * Guarded correction of the showcase seed's workflow execution policy.
 * The original seed stored nodeDefaults as flat numbers; the platform
 * expects a map keyed by node type plus default* fields. This script only
 * accepts the exact prior manifest/options and is safe to rerun.
 */
const fs = require("fs");
const { Client } = require("pg");
const { buildManifest, id } = require("./manifest");
const { validateManifest } = require("./validate");
const { digest } = require("../seed-platform-showcase");

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((out, key) => {
        out[key] = stable(value[key]);
        return out;
      }, {});
  }
  return value;
}

function sameJSON(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

function oldOptions(inputDefinitions) {
  return {
    description: "platform-showcase-v1 · Simulation only: no external side effects.",
    inputDefinitions,
    timeoutSeconds: 120,
    retryLimit: 0,
    nodeDefaults: { timeoutSeconds: 20, retryLimit: 0 },
  };
}

function buildOldManifest(next) {
  const old = JSON.parse(JSON.stringify(next));
  for (const workflow of old.workflows) {
    const current = next.workflows.find((w) => w.workflowID === workflow.workflowID);
    workflow.workflowOptions = oldOptions(current.workflowOptions.inputDefinitions);
  }
  return old;
}

async function correct(client) {
  const next = buildManifest();
  validateManifest(next);
  const old = buildOldManifest(next);
  console.log(JSON.stringify({ oldHash: digest(old), newHash: digest(next) }));

  await client.query("BEGIN");
  try {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [next.version]);
    const cfgRow = (
      await client.query(
        'SELECT config FROM "tblUserTenantConfigMap" WHERE "tenantID"=$1 AND "userID"=$2 FOR UPDATE',
        [next.tenantID, next.ownerID]
      )
    ).rows[0];
    if (!cfgRow) throw new Error("Showcase tenant config not found");

    const rows = (
      await client.query(
        'SELECT "workflowID","workflowOptions" FROM "tblWorkflows" WHERE "tenantID"=$1 AND "creatorID"=$2 FOR UPDATE',
        [next.tenantID, next.ownerID]
      )
    ).rows;
    if (rows.length !== next.workflows.length) {
      throw new Error(`Expected ${next.workflows.length} showcase workflows, found ${rows.length}`);
    }

    const saved = new Map(rows.map((row) => [row.workflowID, row.workflowOptions]));
    const matchesNew = next.workflows.every((workflow) => {
      const target = next.workflows.find((w) => w.workflowID === workflow.workflowID);
      return sameJSON(saved.get(workflow.workflowID), target.workflowOptions);
    });
    if (cfgRow.config?.showcaseManifestHash === digest(next) && matchesNew) {
      await client.query("ROLLBACK");
      return "already_correct";
    }

    const matchesOld = next.workflows.every((workflow) => {
      const prior = old.workflows.find((w) => w.workflowID === workflow.workflowID);
      return sameJSON(saved.get(workflow.workflowID), prior.workflowOptions);
    });
    if (cfgRow.config?.showcaseManifestHash !== digest(old) || !matchesOld) {
      throw new Error("Seed ownership/content drift; refusing workflow policy correction");
    }

    for (const workflow of next.workflows) {
      const result = await client.query(
        'UPDATE "tblWorkflows" SET "workflowOptions"=$1::json,"updatedAt"=now() WHERE "tenantID"=$2 AND "workflowID"=$3 AND "creatorID"=$4',
        [JSON.stringify(workflow.workflowOptions), next.tenantID, workflow.workflowID, next.ownerID]
      );
      if (result.rowCount !== 1) throw new Error(`Workflow update failed for ${workflow.workflowID}`);
    }

    await client.query(
      'UPDATE "tblUserTenantConfigMap" SET config=$1::jsonb WHERE "tenantID"=$2 AND "userID"=$3',
      [JSON.stringify({ ...cfgRow.config, showcaseManifestHash: digest(next) }), next.tenantID, next.ownerID]
    );
    await client.query(
      'INSERT INTO "tblAuditLogs"("auditLogID","tenantID","userID",type,"subType",success,metadata) VALUES($1,$2,$3,$4,$5,true,$6::jsonb)',
      [
        id("workflow-options-correction-audit"),
        next.tenantID,
        next.ownerID,
        "SHOWCASE_SEED",
        "WORKFLOW_POLICY_CORRECTION",
        JSON.stringify({
          workflowIDs: next.workflows.map((w) => w.workflowID),
          oldHash: digest(old),
          newHash: digest(next),
        }),
      ]
    );

    await client.query("COMMIT");
    return "corrected";
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Explicit env file required");
  const config = require("dotenv").parse(fs.readFileSync(file));
  const url = new URL(config.DATABASE_URL);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  const local = ["127.0.0.1", "localhost"].includes(url.hostname);
  const client = new Client({
    connectionString: url.toString(),
    ssl: local ? undefined : { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
    query_timeout: 20000,
  });
  try {
    await client.connect();
    console.log(JSON.stringify({ host: url.hostname, result: await correct(client) }));
  } finally {
    await client.end();
  }
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { correct, buildOldManifest, stable };
