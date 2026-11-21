-- Apply before deploying the matching backend/worker. No workflow command
-- changes are made here. Never use random UUID identity as execution order.
-- Legacy backfill is best-effort: tied timestamps cannot recover lost order.
-- The repository's run-manual-migrations.js supplies the transaction, including
-- its migration ledger write. Do not execute this script outside a transaction.
LOCK TABLE "tblWorkflowInstanceLogs" IN ACCESS EXCLUSIVE MODE;

ALTER TABLE "tblWorkflowInstances"
  ADD COLUMN IF NOT EXISTS "finalContext" JSONB,
  ADD COLUMN IF NOT EXISTS "workflowOutput" JSONB,
  ADD COLUMN IF NOT EXISTS "contextProjection" JSONB,
  ADD COLUMN IF NOT EXISTS "projectionSequence" BIGINT;
ALTER TABLE "tblWorkflowInstanceLogs"
  ADD COLUMN IF NOT EXISTS "eventSequence" BIGINT,
  ADD COLUMN IF NOT EXISTS "eventKey" VARCHAR;
CREATE SEQUENCE IF NOT EXISTS "tblWorkflowInstanceLogs_eventSequence_seq";
ALTER SEQUENCE "tblWorkflowInstanceLogs_eventSequence_seq"
  OWNED BY "tblWorkflowInstanceLogs"."eventSequence";

WITH ordered AS (
  SELECT "logID", ROW_NUMBER() OVER (ORDER BY "createdAt", "logID") AS seq
  FROM "tblWorkflowInstanceLogs"
)
UPDATE "tblWorkflowInstanceLogs" l SET "eventSequence" = ordered.seq
FROM ordered WHERE l."logID" = ordered."logID" AND l."eventSequence" IS NULL;

SELECT setval('"tblWorkflowInstanceLogs_eventSequence_seq"',
  COALESCE((SELECT MAX("eventSequence") FROM "tblWorkflowInstanceLogs"), 0) + 1, false);
ALTER TABLE "tblWorkflowInstanceLogs"
  ALTER COLUMN "eventSequence" SET DEFAULT nextval('"tblWorkflowInstanceLogs_eventSequence_seq"'),
  ALTER COLUMN "eventSequence" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "tblWorkflowInstanceLogs_eventSequence_key"
  ON "tblWorkflowInstanceLogs" ("eventSequence");
CREATE UNIQUE INDEX IF NOT EXISTS "tblWorkflowInstanceLogs_instanceID_eventKey_key"
  ON "tblWorkflowInstanceLogs" ("instanceID", "eventKey");
DROP INDEX IF EXISTS "idx_tblWorkflowInstanceLogs_instance_seq";
CREATE INDEX "idx_tblWorkflowInstanceLogs_instance_seq"
  ON "tblWorkflowInstanceLogs" ("instanceID", "eventSequence");
