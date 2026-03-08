-- Widget Vega-First Architecture Migration
-- Date: 2026-02-07
-- Description: Makes widgetType optional and sets default to 'vega-lite' for new widgets

-- ===== STEP 1: Make widgetType nullable (backwards compatible) =====
-- This allows new widgets to be created without specifying a widgetType

ALTER TABLE "tblWidgets" ALTER COLUMN "widgetType" DROP NOT NULL;

-- ===== STEP 2: Set default value for new widgets =====
-- New widgets default to 'vega-lite' type

ALTER TABLE "tblWidgets" ALTER COLUMN "widgetType" SET DEFAULT 'vega-lite';

-- ===== STEP 3: Add comment for documentation =====

COMMENT ON COLUMN "tblWidgets"."widgetType" IS 'DEPRECATED: Widget type identifier. Now optional - new architecture uses vegaSpec in widgetConfig directly. Kept for backwards compatibility with legacy widgets.';

-- ===== VERIFICATION QUERY =====
-- Run this after migration to verify:
-- SELECT widgetID, widgetType, widgetConfig->'vegaSpec' IS NOT NULL as has_vega_spec FROM "tblWidgets" LIMIT 10;

-- ===== FUTURE CLEANUP (DO NOT RUN YET) =====
-- After full migration to Vega-first architecture, you can optionally:
-- 
-- 1. Migrate existing widgets to have vegaSpec in widgetConfig:
--    UPDATE "tblWidgets" 
--    SET "widgetConfig" = "widgetConfig" || '{"vegaSpec": {...}}'::jsonb
--    WHERE "widgetType" IN ('bar', 'line', 'pie') AND "widgetConfig"->>'vegaSpec' IS NULL;
--
-- 2. Eventually drop the widgetType column (far future):
--    ALTER TABLE "tblWidgets" DROP COLUMN "widgetType";
