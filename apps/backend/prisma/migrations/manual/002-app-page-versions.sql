-- ============================================================
-- Migration: App page version history (002)
-- Stores immutable snapshots of appPageTitle + appPageConfig on every
-- update so pages can be listed, previewed and restored.
-- No FK constraints (house convention keeps cross-asset cleanup in the
-- service layer); tenant + page scoping enforced in queries.
-- ============================================================

CREATE TABLE IF NOT EXISTS "tblAppPageVersions" (
  "appPageVersionID"  UUID          NOT NULL DEFAULT gen_random_uuid(),
  "appPageID"         UUID          NOT NULL,
  "tenantID"          UUID          NOT NULL,
  "versionNumber"     INTEGER       NOT NULL,
  "appPageTitle"      VARCHAR,
  "appPageDescription" VARCHAR,
  "appPageConfig"     JSONB,
  "changeNote"        VARCHAR,
  "creatorID"         UUID,
  "createdByApiKeyID" UUID,
  "createdAt"         TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "tblAppPageVersions_pkey" PRIMARY KEY ("appPageVersionID"),
  CONSTRAINT "tblAppPageVersions_version_unique" UNIQUE ("appPageID", "versionNumber")
);

CREATE INDEX IF NOT EXISTS "idx_tblAppPageVersions_page"
  ON "tblAppPageVersions" ("tenantID", "appPageID", "versionNumber" DESC);
