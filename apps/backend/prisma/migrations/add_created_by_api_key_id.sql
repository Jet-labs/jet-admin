-- Migration: Add createdByApiKeyID field to track API key-based resource creation
-- This field is nullable and optional - only populated when a resource is created via API key

-- Add column to tblDashboards
ALTER TABLE "tblDashboards" 
ADD COLUMN "createdByApiKeyID" UUID NULL;

-- Add column to tblDataQueries
ALTER TABLE "tblDataQueries" 
ADD COLUMN "createdByApiKeyID" UUID NULL;

-- Add column to tblDatasources
ALTER TABLE "tblDatasources" 
ADD COLUMN "createdByApiKeyID" UUID NULL;

-- Add column to tblWidgets
ALTER TABLE "tblWidgets" 
ADD COLUMN "createdByApiKeyID" UUID NULL;

-- Add column to tblWorkflows
ALTER TABLE "tblWorkflows" 
ADD COLUMN "createdByApiKeyID" UUID NULL;

-- Add column to tblTenants (for tenant creation via API key)
ALTER TABLE "tblTenants" 
ADD COLUMN "createdByApiKeyID" UUID NULL;

-- Add column to tblAPIKeys (for API key creation via another API key)
ALTER TABLE "tblAPIKeys" 
ADD COLUMN "createdByApiKeyID" UUID NULL;

-- Add foreign key constraints to reference tblAPIKeys
ALTER TABLE "tblDashboards"
ADD CONSTRAINT "fkTblDashboardsCreatedByApiKeyID" 
FOREIGN KEY ("createdByApiKeyID") 
REFERENCES "tblAPIKeys"("apiKeyID") 
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "tblDataQueries"
ADD CONSTRAINT "fkTblDataQueriesCreatedByApiKeyID" 
FOREIGN KEY ("createdByApiKeyID") 
REFERENCES "tblAPIKeys"("apiKeyID") 
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "tblDatasources"
ADD CONSTRAINT "fkTblDatasourcesCreatedByApiKeyID" 
FOREIGN KEY ("createdByApiKeyID") 
REFERENCES "tblAPIKeys"("apiKeyID") 
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "tblWidgets"
ADD CONSTRAINT "fkTblWidgetsCreatedByApiKeyID" 
FOREIGN KEY ("createdByApiKeyID") 
REFERENCES "tblAPIKeys"("apiKeyID") 
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "tblWorkflows"
ADD CONSTRAINT "fkTblWorkflowsCreatedByApiKeyID" 
FOREIGN KEY ("createdByApiKeyID") 
REFERENCES "tblAPIKeys"("apiKeyID") 
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "tblTenants"
ADD CONSTRAINT "fkTblTenantsCreatedByApiKeyID" 
FOREIGN KEY ("createdByApiKeyID") 
REFERENCES "tblAPIKeys"("apiKeyID") 
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "tblAPIKeys"
ADD CONSTRAINT "fkTblAPIKeysCreatedByApiKeyID" 
FOREIGN KEY ("createdByApiKeyID") 
REFERENCES "tblAPIKeys"("apiKeyID") 
ON DELETE SET NULL ON UPDATE NO ACTION;

-- Create indexes for better query performance when filtering by API key
CREATE INDEX "idx_tblDashboards_createdByApiKeyID" ON "tblDashboards"("createdByApiKeyID");
CREATE INDEX "idx_tblDataQueries_createdByApiKeyID" ON "tblDataQueries"("createdByApiKeyID");
CREATE INDEX "idx_tblDatasources_createdByApiKeyID" ON "tblDatasources"("createdByApiKeyID");
CREATE INDEX "idx_tblWidgets_createdByApiKeyID" ON "tblWidgets"("createdByApiKeyID");
CREATE INDEX "idx_tblWorkflows_createdByApiKeyID" ON "tblWorkflows"("createdByApiKeyID");
CREATE INDEX "idx_tblTenants_createdByApiKeyID" ON "tblTenants"("createdByApiKeyID");
CREATE INDEX "idx_tblAPIKeys_createdByApiKeyID" ON "tblAPIKeys"("createdByApiKeyID");
