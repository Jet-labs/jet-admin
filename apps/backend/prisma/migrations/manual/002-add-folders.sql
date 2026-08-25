-- ============================================================
-- Migration: Folders for organization
-- Adds tblFolders (self-referencing tree, per-entityType) and
-- nullable folderID columns on the organizable entity tables.
-- Deleting a folder un-files its contents via ON DELETE SET NULL.
-- ============================================================

-- 1. Folders table
CREATE TABLE IF NOT EXISTS "tblFolders" (
    "folderID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "folderTitle" VARCHAR(255) NOT NULL,
    "tenantID" UUID NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "parentFolderID" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorID" UUID,

    CONSTRAINT "tblFolders_pkey" PRIMARY KEY ("folderID")
);

-- 2. Self-referencing parent FK + tenant/creator FKs
ALTER TABLE "tblFolders"
  ADD CONSTRAINT "fkTblFoldersParentFolderID"
  FOREIGN KEY ("parentFolderID") REFERENCES "tblFolders"("folderID")
  ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "tblFolders"
  ADD CONSTRAINT "fkTblFoldersTenantID"
  FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID")
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "tblFolders"
  ADD CONSTRAINT "fkTblFoldersCreatorID"
  FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX IF NOT EXISTS "idx_tblFolders_tenantID_entityType" ON "tblFolders"("tenantID", "entityType");
CREATE INDEX IF NOT EXISTS "idx_tblFolders_parentFolderID" ON "tblFolders"("parentFolderID");

-- 3. folderID columns on entity tables
ALTER TABLE "tblWidgets"     ADD COLUMN IF NOT EXISTS "folderID" UUID;
ALTER TABLE "tblWorkflows"   ADD COLUMN IF NOT EXISTS "folderID" UUID;
ALTER TABLE "tblDataQueries" ADD COLUMN IF NOT EXISTS "folderID" UUID;
ALTER TABLE "tblCronJobs"    ADD COLUMN IF NOT EXISTS "folderID" UUID;
ALTER TABLE "tblAppPages"    ADD COLUMN IF NOT EXISTS "folderID" UUID;

-- 4. Entity folder FKs
ALTER TABLE "tblWidgets"     ADD CONSTRAINT "fkTblWidgetsFolderID"     FOREIGN KEY ("folderID") REFERENCES "tblFolders"("folderID") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "tblWorkflows"   ADD CONSTRAINT "fkTblWorkflowsFolderID"   FOREIGN KEY ("folderID") REFERENCES "tblFolders"("folderID") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "tblDataQueries" ADD CONSTRAINT "fkTblDataQueriesFolderID" FOREIGN KEY ("folderID") REFERENCES "tblFolders"("folderID") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "tblCronJobs"    ADD CONSTRAINT "fkTblCronJobsFolderID"    FOREIGN KEY ("folderID") REFERENCES "tblFolders"("folderID") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "tblAppPages"    ADD CONSTRAINT "fkTblAppPagesFolderID"    FOREIGN KEY ("folderID") REFERENCES "tblFolders"("folderID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- 5. Entity folder indexes
CREATE INDEX IF NOT EXISTS "idx_tblWidgets_folderID"     ON "tblWidgets"("folderID");
CREATE INDEX IF NOT EXISTS "idx_tblWorkflows_folderID"   ON "tblWorkflows"("folderID");
CREATE INDEX IF NOT EXISTS "idx_tblDataQueries_folderID" ON "tblDataQueries"("folderID");
CREATE INDEX IF NOT EXISTS "idx_tblCronJobs_folderID"    ON "tblCronJobs"("folderID");
CREATE INDEX IF NOT EXISTS "idx_tblAppPages_folderID"    ON "tblAppPages"("folderID");

-- 6. Listeners also participate in folders
ALTER TABLE "tblListeners" ADD COLUMN IF NOT EXISTS "folderID" UUID;
ALTER TABLE "tblListeners" ADD CONSTRAINT "fkTblListenersFolderID" FOREIGN KEY ("folderID") REFERENCES "tblFolders"("folderID") ON DELETE SET NULL ON UPDATE NO ACTION;
CREATE INDEX IF NOT EXISTS "idx_tblListeners_folderID" ON "tblListeners"("folderID");
