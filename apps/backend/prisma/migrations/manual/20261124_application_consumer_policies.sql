-- Application consumer route/action policy.
-- When enabled, runtime access is default-deny except for explicit grants.
-- Deny entries take precedence over grants for the same subject/scope.

CREATE TABLE IF NOT EXISTS "tblApplicationConsumerConfigs" (
  "applicationID" UUID PRIMARY KEY,
  "tenantID" UUID NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "fk_application_consumer_config_application"
    FOREIGN KEY ("tenantID", "applicationID") REFERENCES "tblApplications"("tenantID", "applicationID")
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "uq_application_consumer_config_scope" UNIQUE ("tenantID", "applicationID")
);

CREATE INDEX IF NOT EXISTS "idx_application_consumer_config"
  ON "tblApplicationConsumerConfigs" ("tenantID", "applicationID");

CREATE TABLE IF NOT EXISTS "tblApplicationConsumerPolicies" (
  "policyID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicationID" UUID NOT NULL,
  "tenantID" UUID NOT NULL,
  "policyKey" VARCHAR(255) NOT NULL,
  "subjectType" VARCHAR(20) NOT NULL,
  "subjectID" UUID NOT NULL,
  "routeID" VARCHAR(64),
  "actionKey" VARCHAR(64),
  "allow" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "fk_application_consumer_policy_application"
    FOREIGN KEY ("tenantID", "applicationID") REFERENCES "tblApplications"("tenantID", "applicationID")
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "uq_application_consumer_policy" UNIQUE ("applicationID", "policyKey")
);

CREATE INDEX IF NOT EXISTS "idx_application_consumer_policies"
  ON "tblApplicationConsumerPolicies" ("tenantID", "applicationID");
