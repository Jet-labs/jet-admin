-- Additive Applications foundation. No business data or existing policies are changed.
BEGIN;
SELECT pg_advisory_xact_lock(hashtextextended('applications-foundation-migration', 0));
CREATE UNIQUE INDEX IF NOT EXISTS uq_application_page_target ON "tblAppPages" ("tenantID", "appPageID");
CREATE UNIQUE INDEX IF NOT EXISTS uq_application_widget_target ON "tblWidgets" ("tenantID", "widgetID");
CREATE UNIQUE INDEX IF NOT EXISTS uq_application_query_target ON "tblDataQueries" ("tenantID", "dataQueryID");
CREATE UNIQUE INDEX IF NOT EXISTS uq_application_workflow_target ON "tblWorkflows" ("tenantID", "workflowID");
CREATE UNIQUE INDEX IF NOT EXISTS uq_application_listener_target ON "tblListeners" ("tenantID", "listenerID");
CREATE UNIQUE INDEX IF NOT EXISTS uq_application_cron_target ON "tblCronJobs" ("tenantID", "cronJobID");
CREATE UNIQUE INDEX IF NOT EXISTS uq_application_datasource_target ON "tblDatasources" ("tenantID", "datasourceID");

CREATE TABLE IF NOT EXISTS "tblApplications" (
  "applicationID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantID" uuid NOT NULL REFERENCES "tblTenants" ("tenantID") ON DELETE CASCADE,
  title varchar(255) NOT NULL, slug varchar(80) NOT NULL, description text,
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ARCHIVED')),
  "creatorID" uuid REFERENCES "tblUsers" ("userID") ON DELETE SET NULL,
  "createdByApiKeyID" uuid REFERENCES "tblAPIKeys" ("apiKeyID") ON DELETE SET NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_application_tenant_id UNIQUE ("tenantID", "applicationID"),
  CONSTRAINT uq_application_tenant_slug UNIQUE ("tenantID", slug)
);
CREATE INDEX IF NOT EXISTS idx_application_tenant_status ON "tblApplications" ("tenantID", status, "createdAt");

CREATE TABLE IF NOT EXISTS "tblApplicationDrafts" (
  "applicationID" uuid PRIMARY KEY, "tenantID" uuid NOT NULL,
  "schemaVersion" integer NOT NULL DEFAULT 1 CHECK ("schemaVersion" = 1),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0), definition jsonb NOT NULL,
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_application_draft_tenant_id UNIQUE ("tenantID", "applicationID"),
  FOREIGN KEY ("tenantID", "applicationID") REFERENCES "tblApplications" ("tenantID", "applicationID") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "tblApplicationAssets" (
  "applicationAssetID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicationID" uuid NOT NULL, "tenantID" uuid NOT NULL,
  "assetKey" varchar(64) NOT NULL, "assetType" varchar(30) NOT NULL,
  -- Managed ownership is deliberately disabled until all legacy mutation guards exist.
  "managementMode" varchar(20) NOT NULL DEFAULT 'referenced' CHECK ("managementMode" = 'referenced'),
  "appPageID" uuid, "widgetID" uuid, "dataQueryID" uuid, "workflowID" uuid,
  "listenerID" uuid, "cronJobID" uuid, "datasourceID" uuid,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY ("tenantID", "applicationID") REFERENCES "tblApplications" ("tenantID", "applicationID") ON DELETE CASCADE,
  FOREIGN KEY ("tenantID", "appPageID") REFERENCES "tblAppPages" ("tenantID", "appPageID"),
  FOREIGN KEY ("tenantID", "widgetID") REFERENCES "tblWidgets" ("tenantID", "widgetID"),
  FOREIGN KEY ("tenantID", "dataQueryID") REFERENCES "tblDataQueries" ("tenantID", "dataQueryID"),
  FOREIGN KEY ("tenantID", "workflowID") REFERENCES "tblWorkflows" ("tenantID", "workflowID"),
  FOREIGN KEY ("tenantID", "listenerID") REFERENCES "tblListeners" ("tenantID", "listenerID"),
  FOREIGN KEY ("tenantID", "cronJobID") REFERENCES "tblCronJobs" ("tenantID", "cronJobID"),
  FOREIGN KEY ("tenantID", "datasourceID") REFERENCES "tblDatasources" ("tenantID", "datasourceID"),
  CONSTRAINT application_asset_one_target CHECK (num_nonnulls("appPageID", "widgetID", "dataQueryID", "workflowID", "listenerID", "cronJobID", "datasourceID") = 1),
  CONSTRAINT application_asset_target_type CHECK (
    ("assetType" = 'appPage' AND "appPageID" IS NOT NULL) OR
    ("assetType" = 'widget' AND "widgetID" IS NOT NULL) OR
    ("assetType" = 'dataQuery' AND "dataQueryID" IS NOT NULL) OR
    ("assetType" = 'workflow' AND "workflowID" IS NOT NULL) OR
    ("assetType" = 'listener' AND "listenerID" IS NOT NULL) OR
    ("assetType" = 'cronJob' AND "cronJobID" IS NOT NULL) OR
    ("assetType" = 'datasource' AND "datasourceID" IS NOT NULL)),
  CONSTRAINT uq_application_asset_key UNIQUE ("applicationID", "assetKey"),
  CONSTRAINT uq_application_page UNIQUE ("applicationID", "appPageID"),
  CONSTRAINT uq_application_widget UNIQUE ("applicationID", "widgetID"),
  CONSTRAINT uq_application_query UNIQUE ("applicationID", "dataQueryID"),
  CONSTRAINT uq_application_workflow UNIQUE ("applicationID", "workflowID"),
  CONSTRAINT uq_application_listener UNIQUE ("applicationID", "listenerID"),
  CONSTRAINT uq_application_cron UNIQUE ("applicationID", "cronJobID"),
  CONSTRAINT uq_application_datasource UNIQUE ("applicationID", "datasourceID")
);
CREATE INDEX IF NOT EXISTS idx_application_assets_tenant ON "tblApplicationAssets" ("tenantID", "applicationID");

INSERT INTO "tblPermissions" ("permissionTitle", "permissionDescription")
SELECT title, description FROM (VALUES
  ('tenant:application:list', 'List applications in a tenant'),
  ('tenant:application:create', 'Create an application draft'),
  ('tenant:application:read', 'Read an application composition'),
  ('tenant:application:update', 'Edit and preview an application draft'),
  ('tenant:application:archive', 'Archive an application without deleting its assets')
) AS permissions(title, description)
WHERE NOT EXISTS (SELECT 1 FROM "tblPermissions" existing WHERE existing."permissionTitle" = permissions.title);
COMMIT;
