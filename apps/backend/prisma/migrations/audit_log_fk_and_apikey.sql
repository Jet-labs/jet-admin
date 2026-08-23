-- ============================================================
-- Migration: tblAuditLogs – link userID to tblUsers
--            and add apiKeyID column linked to tblAPIKeys
-- Run this script; do NOT edit schema.prisma directly.
-- ============================================================

BEGIN;

-- 1. Add the apiKeyID column (nullable, uuid)
ALTER TABLE "tblAuditLogs"
  ADD COLUMN IF NOT EXISTS "apiKeyID" UUID NULL;

-- 2. Foreign key: tblAuditLogs.userID → tblUsers.userID
--    (The column already exists; we just add the constraint.)
ALTER TABLE "tblAuditLogs"
  ADD CONSTRAINT "fkTblAuditLogsUserID"
  FOREIGN KEY ("userID")
  REFERENCES "tblUsers" ("userID")
  ON DELETE SET NULL
  ON UPDATE NO ACTION
  NOT VALID;          -- NOT VALID skips re-scanning existing rows

-- Validate in a separate step so it doesn't hold a full table lock
ALTER TABLE "tblAuditLogs"
  VALIDATE CONSTRAINT "fkTblAuditLogsUserID";

-- 3. Foreign key: tblAuditLogs.apiKeyID → tblAPIKeys.apiKeyID
ALTER TABLE "tblAuditLogs"
  ADD CONSTRAINT "fkTblAuditLogsApiKeyID"
  FOREIGN KEY ("apiKeyID")
  REFERENCES "tblAPIKeys" ("apiKeyID")
  ON DELETE SET NULL
  ON UPDATE NO ACTION
  NOT VALID;

ALTER TABLE "tblAuditLogs"
  VALIDATE CONSTRAINT "fkTblAuditLogsApiKeyID";

-- 4. Index on apiKeyID for fast look-ups
CREATE INDEX IF NOT EXISTS "idx_tblAuditLogs_apiKeyID"
  ON "tblAuditLogs" ("apiKeyID");

-- 5. Index on userID (optional but useful for filtering)
CREATE INDEX IF NOT EXISTS "idx_tblAuditLogs_userID"
  ON "tblAuditLogs" ("userID");

COMMIT;
