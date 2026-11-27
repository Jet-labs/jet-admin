-- Optional exact App Page version pin for an Application draft asset.
-- NULL means "capture the latest page version when the application is published".
ALTER TABLE "tblApplicationAssets"
  ADD COLUMN IF NOT EXISTS "pageVersionID" UUID;

DO $$ BEGIN
  ALTER TABLE "tblAssetVersions"
    ADD CONSTRAINT "uq_asset_version_tenant_scope"
    UNIQUE ("tenantID", "assetVersionID");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "tblApplicationAssets"
    ADD CONSTRAINT "fk_application_asset_page_version"
    FOREIGN KEY ("tenantID", "pageVersionID")
    REFERENCES "tblAssetVersions" ("tenantID", "assetVersionID")
    ON DELETE NO ACTION ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "idx_application_assets_page_version"
  ON "tblApplicationAssets" ("tenantID", "pageVersionID");
