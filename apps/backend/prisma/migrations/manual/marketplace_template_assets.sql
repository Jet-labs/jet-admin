-- Marketplace App Template binary assets.
-- Template packages are stored in tblMarketplaceItem.payload; assets live here
-- so the runtime never reads the authoring folder from disk.
CREATE TABLE IF NOT EXISTS "tblMarketplaceTemplateAssets" (
  "assetID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "templateSlug" VARCHAR(160) NOT NULL,
  "assetPath" VARCHAR(255) NOT NULL,
  "mimeType" VARCHAR(120) NOT NULL,
  "content" BYTEA NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "uq_tblMarketplaceTemplateAssets_slug_path" UNIQUE ("templateSlug", "assetPath")
);

CREATE INDEX IF NOT EXISTS "idx_tblMarketplaceTemplateAssets_slug"
  ON "tblMarketplaceTemplateAssets" ("templateSlug");
