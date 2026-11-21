-- ============================================================
-- Migration: Datasource folders
-- Adds nullable folderID to tblDatasources so datasources can be
-- filed like the other six organizable entity types.
-- Deleting a folder un-files its datasources via ON DELETE SET NULL.
-- Backend code: folder.validator FOLDER_ENTITY_TYPES + folder.service
-- ENTITY_CONFIG + folder.v1.routes MOVE_REQ_KEY_BY_TYPE.
-- ============================================================

-- 1. folderID column on datasources
ALTER TABLE "tblDatasources" ADD COLUMN IF NOT EXISTS "folderID" UUID;

-- 2. Datasource folder FK (un-files on folder delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fkTblDatasourcesFolderID'
  ) THEN
    ALTER TABLE "tblDatasources"
      ADD CONSTRAINT "fkTblDatasourcesFolderID"
      FOREIGN KEY ("folderID") REFERENCES "tblFolders"("folderID")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END
$$;

-- 3. Datasource folder index
CREATE INDEX IF NOT EXISTS "idx_tblDatasources_folderID" ON "tblDatasources"("folderID");
