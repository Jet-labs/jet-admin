-- Sub-Workflow (sub-playbook) parent linkage for run history/audit.
-- SAFE direct-apply script: additive only (ADD COLUMN IF NOT EXISTS +
-- CREATE INDEX IF NOT EXISTS). No table rewrite of existing data, no drops.
-- Flow: 1) run this file directly against the DB (psql -f ...),
--        2) npx prisma db pull   (introspect into schema.prisma),
--        3) npx prisma generate  (refresh client).
-- Do NOT run via `prisma migrate` on live data.
ALTER TABLE "tblWorkflowInstances"
  ADD COLUMN IF NOT EXISTS "parentInstanceID" UUID,
  ADD COLUMN IF NOT EXISTS "parentNodeID" VARCHAR;
CREATE INDEX IF NOT EXISTS "idx_tblWorkflowInstances_parentInstanceID"
  ON "tblWorkflowInstances" ("parentInstanceID");
