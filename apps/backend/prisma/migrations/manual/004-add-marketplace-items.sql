-- ============================================================
-- Migration: generalized marketplace store (multi-type items)
-- Holds datasource / widget / workflow / appTemplate items built
-- from the deterministic marketplace catalog.
-- ============================================================

CREATE TABLE IF NOT EXISTS "tblMarketplaceItem" (
    "itemID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR NOT NULL,
    "itemType" VARCHAR NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR,
    "category" VARCHAR,
    "tags" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "icon" VARCHAR,
    "iconColor" VARCHAR,
    "publisher" VARCHAR,
    "version" VARCHAR NOT NULL DEFAULT '1.0.0',
    "payload" JSONB NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "installCount" INTEGER NOT NULL DEFAULT 0,
    "sourceFamily" VARCHAR,
    "publishedByUserID" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblMarketplaceItem_pkey" PRIMARY KEY ("itemID"),
    CONSTRAINT "tblMarketplaceItem_slug_key" UNIQUE ("slug")
);

CREATE INDEX IF NOT EXISTS "idx_tblMarketplaceItem_itemType" ON "tblMarketplaceItem"("itemType");
CREATE INDEX IF NOT EXISTS "idx_tblMarketplaceItem_category" ON "tblMarketplaceItem"("category");
CREATE INDEX IF NOT EXISTS "idx_tblMarketplaceItem_sourceFamily" ON "tblMarketplaceItem"("sourceFamily");
