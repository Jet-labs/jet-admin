/**
 * Guarded production correction for the showcase UX upgrade:
 * - workflow completion/error toasts on trigger widgets
 * - Event Lab loading/result widgets and failure demo
 * - Events workflow failure branch
 *
 * Accepts only the exact previously seeded manifest (hash 2b0aaa…) and is
 * idempotent. Usage:
 *   node scripts/showcase/correct-showcase-ux.js --env ../../.env \
 *     --old ../../reports/qa/evidence/showcase-manifest-before-ux.json \
 *     --output ../../reports/qa/evidence/showcase-ux-correction.json
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const dotenv = require("dotenv");
const { buildManifest, id } = require("./manifest");
const { validateManifest } = require("./validate");
const { digest } = require("../seed-platform-showcase");

const EVENTS_WORKFLOW_ID = "001efddb-2fc1-4eb7-958d-6976e407dbf6";
const EVENTS_NODE_ID = "fbe8f9a8-0bb0-4432-ac57-4d1fbe5cd7b9";
const EVENTS_PAGE_ID = "2b9b52cb-1ef9-4547-9427-07b330b5f975";

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

function parseArgs() {
  const args = process.argv.slice(2);
  const value = (key) => {
    const index = args.indexOf(key);
    return index >= 0 ? args[index + 1] : undefined;
  };
  return {
    env: value("--env"),
    old: value("--old"),
    output: value("--output"),
  };
}

async function correct(client, next, old) {
  validateManifest(next);
  validateManifest(old);
  const oldDigest = digest(old);
  const nextDigest = digest(next);

  await client.query("BEGIN");
  try {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      `${next.version}:ux-correction`,
    ]);

    const cfgRow = (
      await client.query(
        'SELECT config FROM "tblUserTenantConfigMap" WHERE "tenantID"=$1 AND "userID"=$2 FOR UPDATE',
        [next.tenantID, next.ownerID]
      )
    ).rows[0];
    if (!cfgRow) throw new Error("Showcase tenant config not found");

    const rows = (
      await client.query(
        'SELECT * FROM "tblWidgets" WHERE "tenantID"=$1 AND "creatorID"=$2 FOR UPDATE',
        [next.tenantID, next.ownerID]
      )
    ).rows;
    const saved = new Map(rows.map((row) => [row.widgetID, row]));
    const oldWidgets = new Map(old.widgets.map((w) => [w.widgetID, w]));
    const nextWidgets = new Map(next.widgets.map((w) => [w.widgetID, w]));

    const queryRows = (
      await client.query(
        'SELECT "dataQueryID","dataQueryOptions" FROM "tblDataQueries" WHERE "tenantID"=$1 AND "creatorID"=$2 FOR UPDATE',
        [next.tenantID, next.ownerID]
      )
    ).rows;
    const savedQueries = new Map(queryRows.map((row) => [row.dataQueryID, row]));
    const oldQueries = new Map(old.queries.map((q) => [q.dataQueryID, q]));

    const pageRow = (
      await client.query(
        'SELECT "appPageConfig" FROM "tblAppPages" WHERE "appPageID"=$1 AND "tenantID"=$2 FOR UPDATE',
        [EVENTS_PAGE_ID, next.tenantID]
      )
    ).rows[0];
    if (!pageRow) throw new Error("Event Lab app page not found");

    const nodeRow = (
      await client.query(
        'SELECT "nodeConfig" FROM "tblWorkflowNodes" WHERE "nodeID"=$1 AND "workflowID"=$2 FOR UPDATE',
        [EVENTS_NODE_ID, EVENTS_WORKFLOW_ID]
      )
    ).rows[0];
    if (!nodeRow) throw new Error("Events validation node not found");

    const nextPage = next.pages.find((p) => p.appPageID === EVENTS_PAGE_ID);
    const oldPage = old.pages.find((p) => p.appPageID === EVENTS_PAGE_ID);
    const nextNode = next.workflows
      .find((w) => w.workflowID === EVENTS_WORKFLOW_ID)
      .nodes.find((n) => n.nodeID === EVENTS_NODE_ID);
    const oldNode = old.workflows
      .find((w) => w.workflowID === EVENTS_WORKFLOW_ID)
      .nodes.find((n) => n.nodeID === EVENTS_NODE_ID);

    const alreadyCorrect =
      cfgRow.config?.showcaseManifestHash === nextDigest &&
      sameJSON(pageRow.appPageConfig, nextPage.appPageConfig) &&
      nodeRow.nodeConfig?.code === nextNode.nodeConfig.code &&
      next.widgets.every((widget) => {
        const row = saved.get(widget.widgetID);
        return row && sameJSON(row.widgetConfig, widget.widgetConfig);
      }) &&
      next.queries.every((query) => {
        const row = savedQueries.get(query.dataQueryID);
        return row && sameJSON(row.dataQueryOptions, query.dataQueryOptions);
      });
    if (alreadyCorrect) {
      await client.query("ROLLBACK");
      return { result: "already_correct", oldHash: oldDigest, newHash: nextDigest };
    }

    if (cfgRow.config?.showcaseManifestHash !== oldDigest) {
      throw new Error(
        `Manifest hash drift: expected ${oldDigest}, found ${cfgRow.config?.showcaseManifestHash}`
      );
    }
    if (!sameJSON(pageRow.appPageConfig, oldPage.appPageConfig)) {
      throw new Error("Event Lab page drift; refusing UX correction");
    }
    if (nodeRow.nodeConfig?.code !== oldNode.nodeConfig.code) {
      throw new Error("Events validation node drift; refusing UX correction");
    }
    for (const query of old.queries) {
      const stored = savedQueries.get(query.dataQueryID);
      if (!stored || !sameJSON(stored.dataQueryOptions, query.dataQueryOptions)) {
        throw new Error(`Query drift for ${query.dataQueryID}; refusing UX correction`);
      }
    }

    const updatedWidgets = [];
    const insertedWidgets = [];
    for (const widget of next.widgets) {
      const row = saved.get(widget.widgetID);
      if (!row) {
        await client.query(
          `INSERT INTO "tblWidgets"
             ("widgetID","tenantID","creatorID","widgetTitle","widgetDescription","widgetType","widgetConfig","refreshInterval","folderID")
           VALUES ($1,$2,$3,$4,$5,$6,$7::json,$8,$9)`,
          [
            widget.widgetID,
            widget.tenantID,
            widget.creatorID,
            widget.widgetTitle,
            widget.widgetDescription,
            widget.widgetType,
            JSON.stringify(widget.widgetConfig),
            widget.refreshInterval,
            widget.folderID,
          ]
        );
        insertedWidgets.push(widget.widgetID);
        continue;
      }
      if (!sameJSON(row.widgetConfig, widget.widgetConfig)) {
        const result = await client.query(
          'UPDATE "tblWidgets" SET "widgetConfig"=$1::json, "updatedAt"=now() WHERE "widgetID"=$2 AND "tenantID"=$3 AND "creatorID"=$4',
          [JSON.stringify(widget.widgetConfig), widget.widgetID, next.tenantID, next.ownerID]
        );
        if (result.rowCount !== 1) {
          throw new Error(`Widget update failed for ${widget.widgetID}`);
        }
        updatedWidgets.push(widget.widgetID);
      }
    }

    const updatedQueries = [];
    for (const query of next.queries) {
      const oldQuery = oldQueries.get(query.dataQueryID);
      if (!oldQuery) {
        throw new Error(`New query ${query.dataQueryID} is not supported by this correction`);
      }
      if (!sameJSON(oldQuery.dataQueryOptions, query.dataQueryOptions)) {
        const result = await client.query(
          'UPDATE "tblDataQueries" SET "dataQueryOptions"=$1::json, "updatedAt"=now() WHERE "dataQueryID"=$2 AND "tenantID"=$3 AND "creatorID"=$4',
          [
            JSON.stringify(query.dataQueryOptions),
            query.dataQueryID,
            next.tenantID,
            next.ownerID,
          ]
        );
        if (result.rowCount !== 1) {
          throw new Error(`Query update failed for ${query.dataQueryID}`);
        }
        updatedQueries.push(query.dataQueryID);
      }
    }

    await client.query(
      'UPDATE "tblAppPages" SET "appPageConfig"=$1::json, "updatedAt"=now() WHERE "appPageID"=$2 AND "tenantID"=$3 AND "creatorID"=$4',
      [JSON.stringify(nextPage.appPageConfig), EVENTS_PAGE_ID, next.tenantID, next.ownerID]
    );
    await client.query(
      'UPDATE "tblWorkflowNodes" SET "nodeConfig"=$1::json, "updatedAt"=now() WHERE "nodeID"=$2 AND "workflowID"=$3',
      [JSON.stringify(nextNode.nodeConfig), EVENTS_NODE_ID, EVENTS_WORKFLOW_ID]
    );
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
        id(`showcase-ux-correction-audit:${nextDigest}`),
        next.tenantID,
        next.ownerID,
        "SHOWCASE_SEED",
        "SHOWCASE_UX_CORRECTION",
        JSON.stringify({
          oldHash: oldDigest,
          newHash: nextDigest,
          insertedWidgets,
          updatedWidgets,
          updatedQueries,
          eventPageID: EVENTS_PAGE_ID,
          eventsNodeID: EVENTS_NODE_ID,
        }),
      ]
    );

    await client.query("COMMIT");
    return {
      result: "corrected",
      oldHash: oldDigest,
      newHash: nextDigest,
      insertedWidgets,
      updatedWidgets,
      updatedQueries,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function main() {
  const args = parseArgs();
  if (!args.env || !args.old || !args.output) {
    throw new Error("--env, --old and --output are required");
  }
  const env = dotenv.parse(fs.readFileSync(args.env));
  const old = JSON.parse(fs.readFileSync(args.old));
  const next = buildManifest();
  const url = new URL(env.DATABASE_URL);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  const local = ["127.0.0.1", "localhost"].includes(url.hostname);
  const client = new Client({
    connectionString: url.toString(),
    ssl: local ? undefined : { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,
  });
  try {
    await client.connect();
    const outcome = await correct(client, next, old);
    const receipt = {
      appliedAt: new Date().toISOString(),
      host: url.hostname,
      ...outcome,
    };
    fs.writeFileSync(args.output, `${JSON.stringify(receipt, null, 2)}\n`);
    console.log(JSON.stringify(receipt));
  } finally {
    await client.end().catch(() => {});
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { correct, stable, sameJSON };
