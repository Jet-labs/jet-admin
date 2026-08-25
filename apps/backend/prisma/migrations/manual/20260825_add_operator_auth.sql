-- Platform admin console: dedicated operator identity + session store.
-- Deliberately separate from tblUsers / Firebase auth so end-user
-- credentials can never authenticate against the admin control plane.

CREATE TABLE IF NOT EXISTS "tblOperators" (
  "operatorID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "passwordSalt" VARCHAR(255) NOT NULL,
  "operatorTitle" VARCHAR(255),
  "isDisabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "tblOperatorSessions" (
  "sessionID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tokenHash" VARCHAR(255) NOT NULL UNIQUE,
  "operatorID" UUID NOT NULL REFERENCES "tblOperators"("operatorID") ON DELETE CASCADE,
  "userAgent" VARCHAR(255),
  "ipAddress" VARCHAR(64),
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_tblOperatorSessions_operatorID"
  ON "tblOperatorSessions"("operatorID");
