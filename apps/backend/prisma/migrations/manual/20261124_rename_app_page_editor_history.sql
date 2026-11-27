-- Rename the per-save page editor undo/history table so it is not confused
-- with release-grade immutable asset versions in tblAssetVersions.
DO $$
BEGIN
  IF to_regclass('public."tblAppPageVersions"') IS NOT NULL
     AND to_regclass('public."tblAppPageEditorHistory"') IS NULL THEN
    ALTER TABLE "tblAppPageVersions" RENAME TO "tblAppPageEditorHistory";
  END IF;
END $$;

ALTER TABLE IF EXISTS "tblAppPageEditorHistory"
  RENAME CONSTRAINT "tblAppPageVersions_pkey" TO "tblAppPageEditorHistory_pkey";

ALTER TABLE IF EXISTS "tblAppPageEditorHistory"
  RENAME CONSTRAINT "tblAppPageVersions_version_unique" TO "tblAppPageEditorHistory_version_unique";

ALTER INDEX IF EXISTS "idx_tblAppPageVersions_page"
  RENAME TO "idx_tblAppPageEditorHistory_page";
