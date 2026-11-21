-- Apply with the repository manual migration runner's transaction.
ALTER TABLE "tblWorkflowInstances"
  ADD COLUMN IF NOT EXISTS "executionKey" VARCHAR,
  ADD COLUMN IF NOT EXISTS "executionDefinition" JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS "tblWorkflowInstances_tenantID_executionKey_key"
  ON "tblWorkflowInstances" ("tenantID", "executionKey");
