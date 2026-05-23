-- ============================================================
-- Migration: Rename tblDashboards → tblAppPages
-- Data sources and variables are stored in appPageConfig JSON
-- ============================================================

-- 1. Rename table
ALTER TABLE "tblDashboards" RENAME TO "tblAppPages";

-- 2. Rename columns
ALTER TABLE "tblAppPages" RENAME COLUMN "dashboardID" TO "appPageID";
ALTER TABLE "tblAppPages" RENAME COLUMN "dashboardTitle" TO "appPageTitle";
ALTER TABLE "tblAppPages" RENAME COLUMN "dashboardDescription" TO "appPageDescription";
ALTER TABLE "tblAppPages" RENAME COLUMN "dashboardConfig" TO "appPageConfig";

-- 3. Rename primary key index
ALTER INDEX "tblDashboards_pkey" RENAME TO "tblAppPages_pkey";

-- 4. Rename other indexes
ALTER INDEX "idx_tblDashboards_createdByApiKeyID" RENAME TO "idx_tblAppPages_createdByApiKeyID";

-- 5. Rename foreign key constraints
ALTER TABLE "tblAppPages" RENAME CONSTRAINT "fkTblDashboardCreatorID" TO "fkTblAppPageCreatorID";
ALTER TABLE "tblAppPages" RENAME CONSTRAINT "fkTblDashboardsCreatedByApiKeyID" TO "fkTblAppPagesCreatedByApiKeyID";
ALTER TABLE "tblAppPages" RENAME CONSTRAINT "fkTblDashboardsTenantIDTenantID" TO "fkTblAppPagesTenantIDTenantID";
