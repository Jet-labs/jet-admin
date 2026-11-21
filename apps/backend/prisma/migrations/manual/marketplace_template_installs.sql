-- Marketplace App Template install ledger.
-- Additive only. Tracks every platform resource created by a template install
-- so reinstalls are idempotent and uninstall can remove orphans.
CREATE TABLE IF NOT EXISTS "tblMarketplaceTemplateInstalls" (
  "installID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantID" UUID NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "version" VARCHAR(40) NOT NULL,
  "tablePrefix" VARCHAR(80) NOT NULL,
  "options" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "resources" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "tables" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "status" VARCHAR(32) NOT NULL DEFAULT 'INSTALLED',
  "installedByUserID" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "uq_tblMarketplaceTemplateInstalls_tenant_slug" UNIQUE ("tenantID", "slug")
);

CREATE INDEX IF NOT EXISTS "idx_tblMarketplaceTemplateInstalls_tenant"
  ON "tblMarketplaceTemplateInstalls" ("tenantID");
