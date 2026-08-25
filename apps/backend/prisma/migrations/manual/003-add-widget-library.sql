-- ============================================================
-- Migration: Shared widget library (deployment-scoped registry)
-- Stores published widget bundles built on the export bundle format.
-- ============================================================

CREATE TABLE IF NOT EXISTS "tblWidgetLibrary" (
    "libraryEntryID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "widgetTitle" VARCHAR NOT NULL,
    "widgetType" VARCHAR NOT NULL,
    "widgetDescription" VARCHAR,
    "bundle" JSONB NOT NULL,
    "sourceTenantID" UUID,
    "publishedByUserID" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblWidgetLibrary_pkey" PRIMARY KEY ("libraryEntryID")
);

CREATE INDEX IF NOT EXISTS "idx_tblWidgetLibrary_widgetType" ON "tblWidgetLibrary"("widgetType");
