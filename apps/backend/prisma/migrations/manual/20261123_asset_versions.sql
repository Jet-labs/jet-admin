-- Generic immutable asset definition versions.
-- Drafts remain in their existing asset tables.
CREATE TABLE IF NOT EXISTS "tblAssetVersions" (
  "assetVersionID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantID" UUID NOT NULL,
  "assetType" VARCHAR(30) NOT NULL,
  "assetID" UUID NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "schemaVersion" INTEGER NOT NULL DEFAULT 1,
  "contentHash" VARCHAR(64) NOT NULL,
  "payload" JSONB NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'published',
  "changeNote" TEXT,
  "createdByUserID" UUID,
  "createdByApiKeyID" UUID,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "uq_asset_version_number" UNIQUE ("tenantID", "assetType", "assetID", "versionNumber"),
  CONSTRAINT "chk_asset_version_type" CHECK ("assetType" IN ('datasource', 'listener', 'query', 'cronjob', 'widget', 'workflow', 'appPage')),
  CONSTRAINT "chk_asset_version_status" CHECK ("status" IN ('published', 'deprecated', 'revoked'))
);

CREATE INDEX IF NOT EXISTS "idx_asset_versions_asset"
  ON "tblAssetVersions" ("tenantID", "assetType", "assetID", "versionNumber" DESC);

CREATE INDEX IF NOT EXISTS "idx_asset_versions_hash"
  ON "tblAssetVersions" ("tenantID", "assetType", "contentHash");
