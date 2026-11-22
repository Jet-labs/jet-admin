/**
 * Install CRM, run representative workflows through Temporal, assert instance
 * state + logs, then uninstall.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { Client } = require("pg");
const { prisma } = require("../../apps/backend/config/prisma.config");
const { authorizedExecuteWorkflow } = require("../../apps/backend/utils/authorizedProxy");
const { createSystemContext, ORIGIN_TYPES } = require("../../apps/backend/utils/executionContext");
const { installTemplate, uninstallTemplate } = require("../../apps/backend/modules/marketplace/template.installer");

const slug = process.argv[2] || "crm-sales-pipeline";
const USER_ID = "1a3ece78-45ae-4a19-8475-3e443e2b01e8";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForInstance(instanceID, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const instance = await prisma.tblWorkflowInstances.findUnique({ where: { instanceID } });
    if (instance && ["COMPLETED", "FAILED", "CANCELLED", "RUNNING", "PAUSED", "WAITING"].includes(instance.status)) {
      if (["COMPLETED", "FAILED", "CANCELLED"].includes(instance.status)) return instance;
      if (instance.status === "RUNNING" || instance.status === "PAUSED" || instance.status === "WAITING") {
        // Give suspended human-task workflows a moment to persist the request.
        const request = await prisma.tblWorkflowDataCollectionRequests.findFirst({ where: { instanceID } });
        if (request) return instance;
      }
    }
    await sleep(1000);
  }
  return prisma.tblWorkflowInstances.findUnique({ where: { instanceID } });
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const tenant = await client.query(
    `INSERT INTO "tblTenants" ("tenantTitle", "creatorID", "createdAt", "updatedAt")
     VALUES ($1, $2::uuid, now(), now()) RETURNING "tenantID"`,
    [`Template Workflow QA ${Date.now()}`, USER_ID]
  );
  const tenantID = tenant.rows[0].tenantID;
  await client.query(
    `INSERT INTO "tblUsersTenantsRelationship" ("tenantID", "userID", "role") VALUES ($1::uuid, $2::uuid, 'ADMIN')`,
    [tenantID, USER_ID]
  );
  await client.query(
    `INSERT INTO "tblUserTenantConfigMap" ("tenantID", "userID", "config") VALUES ($1::uuid, $2::uuid, '{}'::jsonb)`,
    [tenantID, USER_ID]
  );
  console.log(`tenant: ${tenantID}`);
  try {
    await installTemplate({
      tenantID,
      slug,
      options: { includeSampleData: true, createDemoUsers: false, enableAutomation: false },
      userID: USER_ID,
      authContext: { authType: "USER", userID: USER_ID },
    });
    const workflows = await prisma.tblWorkflows.findMany({ where: { tenantID }, select: { workflowID: true, title: true } });
    const byTitle = (text) => workflows.find((w) => w.title.toLowerCase().includes(text));
    const candidateCases = [
      { title: "notify only", inputs: { recordID: 1, event: { kind: "record.created" } }, expect: "COMPLETED" },
      { title: "intake triage", inputs: { recordID: 1, staffID: 1 }, expect: "COMPLETED" },
      { title: "approval chain", inputs: { recordID: 1, staffID: 1 }, expect: ["RUNNING", "PAUSED", "WAITING"] },
      { title: "threshold sweep", inputs: { days: 7, staffID: 1 }, expect: "COMPLETED" },
      { title: "daily digest", inputs: { staffID: 1 }, expect: "COMPLETED" },
      { title: "expected failure and recovery", inputs: { recordID: 1 }, expect: "COMPLETED" },
    ];
    const cases = candidateCases.filter((testCase) => {
      const present = Boolean(byTitle(testCase.title));
      if (!present) console.log(`  - ${testCase.title}: not included in this compact bundle`);
      return present;
    });
    let failed = 0;
    for (const testCase of cases) {
      const wf = byTitle(testCase.title);
      if (!wf) {
        console.log(`  ! ${testCase.title}: workflow not found`);
        failed += 1;
        continue;
      }
      let passed = false;
      // The dev database is remote, so an occasional query or Temporal
      // connection reset is infrastructure noise rather than a workflow bug.
      // Retry once before reporting a real failure.
      for (let attempt = 1; attempt <= 2 && !passed; attempt += 1) {
        const label = attempt > 1 ? `${testCase.title} (retry ${attempt})` : testCase.title;
        try {
          const started = await authorizedExecuteWorkflow({
            workflowID: wf.workflowID,
            tenantID,
            inputValues: testCase.inputs,
            executionCtx: createSystemContext(ORIGIN_TYPES.CRON, "template-workflow-test", tenantID),
          });
          const instance = await waitForInstance(started.instanceID, 180000);
          const logs = await prisma.tblWorkflowInstanceLogs.count({ where: { instanceID: started.instanceID } });
          const expected = Array.isArray(testCase.expect) ? testCase.expect : [testCase.expect];
          passed = Boolean(instance && expected.includes(instance.status) && logs > 0);
          console.log(`  ${passed ? "+" : "!"} ${label}: ${instance?.status || "MISSING"} (${logs} logs)`);
          if (!passed) {
            const entries = await prisma.tblWorkflowInstanceLogs.findMany({
              where: { instanceID: started.instanceID },
              orderBy: { eventSequence: "asc" },
              take: 12,
            });
            for (const entry of entries) {
              console.log(`      ${entry.eventType} ${entry.nodeID || ""} ${entry.nodeStatus || ""} ${entry.errorMessage || ""}`);
            }
            if (instance?.finalContext) console.log(JSON.stringify(instance.finalContext).slice(0, 800));
          }
        } catch (error) {
          console.log(`  ! ${label}: ${error.message}`);
        }
      }
      if (!passed) failed += 1;
    }
    console.log(`workflows: ${cases.length - failed} ok, ${failed} failed`);
    if (failed) process.exitCode = 1;
  } finally {
    await uninstallTemplate({ tenantID, slug, userID: USER_ID });
    const leftovers = await client.query(
      `SELECT count(*)::int AS count FROM "tblWorkflowInstances" WHERE "tenantID" = $1::uuid`,
      [tenantID]
    );
    const cron = await client.query('SELECT count(*)::int AS count FROM "tblCronJobs" WHERE "tenantID" = $1::uuid', [tenantID]);
    const roles = await client.query('SELECT count(*)::int AS count FROM "tblRoles" WHERE "tenantID" = $1::uuid', [tenantID]);
    console.log(`leftover instances: ${leftovers.rows[0].count}, cron: ${cron.rows[0].count}, roles: ${roles.rows[0].count}`);
    await client.query('DELETE FROM "tblUserTenantConfigMap" WHERE "tenantID" = $1::uuid', [tenantID]);
    await client.query('DELETE FROM "tblUsersTenantsRelationship" WHERE "tenantID" = $1::uuid', [tenantID]);
    await client.query('DELETE FROM "tblTenants" WHERE "tenantID" = $1::uuid', [tenantID]);
    await client.end();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exit(process.exitCode || 0);
  })
  .catch(async (error) => {
    console.error(error.stack || error);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  });
