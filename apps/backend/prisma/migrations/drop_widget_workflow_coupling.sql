-- DropWidgetWorkflowCoupling
-- Migration: Remove workflowID and workflowConfig from tblWidgets
-- This migration drops the foreign key constraint, index, and columns
-- that previously coupled widgets to workflows.

-- 1. Drop the foreign key constraint (if it exists)
ALTER TABLE "tblWidgets" DROP CONSTRAINT IF EXISTS "fkTblWidgetsWorkflowIDWorkflowID";

-- 2. Drop the index on workflowID (if it exists)
DROP INDEX IF EXISTS "idx_tblWidgets_workflowID";

-- 3. Drop the columns
ALTER TABLE "tblWidgets" DROP COLUMN IF EXISTS "workflowID";
ALTER TABLE "tblWidgets" DROP COLUMN IF EXISTS "workflowConfig";
