-- Environment connection binding revisions.
-- Releases pin executable definitions; environment bindings select live
-- datasource connections without storing credentials in releases.

ALTER TABLE "tblApplicationEnvironments"
  ADD COLUMN IF NOT EXISTS "bindingRevision" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "bindings" JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS "tblApplicationEnvironmentBindingRevisions" (
  "bindingRevisionID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "environmentID" UUID NOT NULL,
  "revision" INTEGER NOT NULL,
  "bindings" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "changeNote" VARCHAR(2000),
  "createdByUserID" UUID,
  "createdByApiKeyID" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "fk_application_environment_binding_revision_environment"
    FOREIGN KEY ("environmentID") REFERENCES "tblApplicationEnvironments"("environmentID")
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "uq_application_environment_binding_revision" UNIQUE ("environmentID", "revision")
);

CREATE INDEX IF NOT EXISTS "idx_application_environment_bindings"
  ON "tblApplicationEnvironmentBindingRevisions" ("environmentID", "createdAt");

INSERT INTO "tblApplicationEnvironmentBindingRevisions"
  ("environmentID", "revision", "bindings", "changeNote")
SELECT "environmentID", 1, '{}'::jsonb, 'Initial binding revision'
FROM "tblApplicationEnvironments"
ON CONFLICT ("environmentID", "revision") DO NOTHING;
