-- Immutable release, environment, and deployment state for Applications.
BEGIN;
SELECT pg_advisory_xact_lock(hashtextextended('applications-releases-migration', 0));

CREATE TABLE IF NOT EXISTS "tblApplicationReleases" (
  "releaseID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicationID" uuid NOT NULL,
  "tenantID" uuid NOT NULL,
  "releaseNumber" integer NOT NULL CHECK ("releaseNumber" > 0),
  "sourceRevision" integer NOT NULL,
  "schemaVersion" integer NOT NULL DEFAULT 1,
  "contentHash" varchar(64) NOT NULL,
  "clientManifest" jsonb NOT NULL,
  "serverManifest" jsonb NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY ("tenantID", "applicationID") REFERENCES "tblApplications" ("tenantID", "applicationID") ON DELETE CASCADE,
  CONSTRAINT uq_application_release_number UNIQUE ("applicationID", "releaseNumber"),
  CONSTRAINT uq_application_release_scope UNIQUE ("tenantID", "applicationID", "releaseID")
);
CREATE INDEX IF NOT EXISTS idx_application_releases ON "tblApplicationReleases" ("tenantID", "applicationID", "createdAt");

CREATE TABLE IF NOT EXISTS "tblApplicationEnvironments" (
  "environmentID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicationID" uuid NOT NULL,
  "tenantID" uuid NOT NULL,
  "name" varchar(40) NOT NULL DEFAULT 'production',
  "currentReleaseID" uuid,
  "configRevision" integer NOT NULL DEFAULT 1,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY ("tenantID", "applicationID") REFERENCES "tblApplications" ("tenantID", "applicationID") ON DELETE CASCADE,
  FOREIGN KEY ("currentReleaseID") REFERENCES "tblApplicationReleases" ("releaseID") ON DELETE NO ACTION,
  CONSTRAINT uq_application_environment_name UNIQUE ("applicationID", "name")
);
CREATE INDEX IF NOT EXISTS idx_application_environments ON "tblApplicationEnvironments" ("tenantID", "applicationID");

CREATE TABLE IF NOT EXISTS "tblApplicationDeployments" (
  "deploymentID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "environmentID" uuid NOT NULL REFERENCES "tblApplicationEnvironments" ("environmentID") ON DELETE CASCADE,
  "releaseID" uuid NOT NULL REFERENCES "tblApplicationReleases" ("releaseID") ON DELETE NO ACTION,
  "actorID" uuid,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_application_deployments_env ON "tblApplicationDeployments" ("environmentID", "createdAt");

INSERT INTO "tblPermissions" ("permissionTitle", "permissionDescription")
SELECT title, description FROM (VALUES
  ('tenant:application:publish', 'Compile an immutable application release'),
  ('tenant:application:deploy', 'Deploy an application release to an environment'),
  ('tenant:application:execute', 'Use a deployed application runtime')
) AS permissions(title, description)
WHERE NOT EXISTS (SELECT 1 FROM "tblPermissions" existing WHERE existing."permissionTitle" = permissions.title);
COMMIT;
