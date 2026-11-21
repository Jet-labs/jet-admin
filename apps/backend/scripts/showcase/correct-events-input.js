/**
 * Guarded correction: make the Events showcase workflow tolerate the UI's
 * object-input default serialization (null/JSON-string) by falling back to the
 * documented synthetic envelope. Only the exact previously seeded node code
 * and manifest hash are accepted; reruns are idempotent.
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { buildManifest, id } = require("./manifest");
const { validateManifest } = require("./validate");
const { digest } = require("../seed-platform-showcase");

const EVENTS_WORKFLOW_ID = "001efddb-2fc1-4eb7-958d-6976e407dbf6";
const EVENTS_NODE_ID = "fbe8f9a8-0bb0-4432-ac57-4d1fbe5cd7b9";
const OLD_CODE =
  "var x=ctx.input.event||{};if(!x.event_id)throw new Error('event_id is required');return {event_id:String(x.event_id),order_id:Number(x.order_id||0),severity:x.severity||'info',synthetic:true};";

function buildOldManifest(next) {
  const old = JSON.parse(JSON.stringify(next));
  const workflow = old.workflows.find((w) => w.workflowID === EVENTS_WORKFLOW_ID);
  const node = workflow.nodes.find((n) => n.nodeID === EVENTS_NODE_ID);
  node.nodeConfig.code = OLD_CODE;
  return old;
}

async function correct(client) {
  const next = buildManifest();
  validateManifest(next);
  const old = buildOldManifest(next);
  const nextWorkflow = next.workflows.find((w) => w.workflowID === EVENTS_WORKFLOW_ID);
  const nextNode = nextWorkflow.nodes.find((n) => n.nodeID === EVENTS_NODE_ID);
  const oldDigest = digest(old);
  const nextDigest = digest(next);

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

    const nodeRow = (
      await client.query(
        'SELECT "nodeID","nodeConfig" FROM "tblWorkflowNodes" WHERE "nodeID"=$1 FOR UPDATE',
        [EVENTS_NODE_ID]
      )
    ).rows[0];
    if (!nodeRow) throw new Error("Events validation node not found");

    const savedCode = nodeRow.nodeConfig?.code;
    const configHash = cfgRow.config?.showcaseManifestHash;

    if (configHash === nextDigest && savedCode === nextNode.nodeConfig.code) {
      await client.query("ROLLBACK");
      return { result: "already_correct", oldHash: oldDigest, newHash: nextDigest };
    }
    if (configHash !== oldDigest) {
      throw new Error(
        `Manifest hash drift: expected ${oldDigest}, found ${configHash}`
      );
    }
    if (savedCode !== OLD_CODE) {
      throw new Error("Events node code drift; refusing correction");
    }

    const updatedConfig = {
      ...nodeRow.nodeConfig,
      code: nextNode.nodeConfig.code,
    };
    const result = await client.query(
      'UPDATE "tblWorkflowNodes" SET "nodeConfig"=$1::json, "updatedAt"=now() WHERE "nodeID"=$2',
      [JSON.stringify(updatedConfig), EVENTS_NODE_ID]
    );
    if (result.rowCount !== 1) throw new Error("Events node update failed");

    await client.query(
      'UPDATE "tblUserTenantConfigMap" SET config=$1::jsonb WHERE "tenantID"=$2 AND "userID"=$3',
      [
        JSON.stringify({ ...cfgRow.config, showcaseManifestHash: nextDigest }),
        next.tenantID,
        next.ownerID,
      ]
    );
    await client.query(
      'INSERT INTO "tblAuditLogs"("auditLogID","tenantID","userID",type,"subType",success,metadata) VALUES($1,$2,$3,$4,$5,true,$6::jsonb)',
      [
        id("events-input-correction-audit"),
        next.tenantID,
        next.ownerID,
        "SHOWCASE_SEED",
        "EVENTS_INPUT_FALLBACK_CORRECTION",
        JSON.stringify({
          workflowID: EVENTS_WORKFLOW_ID,
          nodeID: EVENTS_NODE_ID,
          oldHash: oldDigest,
          newHash: nextDigest,
        }),
      ]
    );

    await client.query("COMMIT");
    return { result: "corrected", oldHash: oldDigest, newHash: nextDigest };
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
    const outcome = await correct(client);
    const receipt = {
      appliedAt: new Date().toISOString(),
      host: url.hostname,
      workflowID: EVENTS_WORKFLOW_ID,
      nodeID: EVENTS_NODE_ID,
      ...outcome,
    };
    const receiptPath = path.resolve(
      __dirname,
      "../../../../reports/qa/evidence/showcase-events-input-correction.json"
    );
    fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    console.log(JSON.stringify(receipt));
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { correct, buildOldManifest };
