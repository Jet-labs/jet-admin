-- Dependency edges used for version impact analysis and retention checks.
CREATE TABLE IF NOT EXISTS "tblAssetVersionReferences" (
  "referenceID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantID" UUID NOT NULL,
  "parentType" VARCHAR(20) NOT NULL,
  "parentVersionID" UUID,
  "parentReleaseID" UUID,
  "childVersionID" UUID NOT NULL,
  "referenceKey" VARCHAR(200) NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "uq_asset_version_reference_key" UNIQUE ("referenceKey"),
  CONSTRAINT "chk_asset_version_reference_parent" CHECK (
    ("parentType" = 'assetVersion' AND "parentVersionID" IS NOT NULL AND "parentReleaseID" IS NULL)
    OR ("parentType" = 'applicationRelease' AND "parentReleaseID" IS NOT NULL AND "parentVersionID" IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS "idx_asset_version_refs_child"
  ON "tblAssetVersionReferences" ("tenantID", "childVersionID");

CREATE INDEX IF NOT EXISTS "idx_asset_version_refs_parent"
  ON "tblAssetVersionReferences" ("tenantID", "parentVersionID");
