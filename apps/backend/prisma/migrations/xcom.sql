-- ============================================================================
-- Migration: Unified tblWorkflowInstanceLogs
-- Drops tblNodeExecutionLogs, contextData column.
-- Creates tblWorkflowInstanceLogs as the single append-only event store.
-- ============================================================================

BEGIN;

-- 1. Drop contextData from tblWorkflowInstances
ALTER TABLE "tblWorkflowInstances"
  DROP COLUMN IF EXISTS "contextData";

-- 2. Drop the old split tables
--    FK on tblNodeExecutionLogs references tblWorkflowNodes — drop FK first
ALTER TABLE "tblNodeExecutionLogs"
  DROP CONSTRAINT IF EXISTS "tblNodeExecutionLogs_nodeID_fkey";

DROP TABLE IF EXISTS "tblNodeExecutionLogs";

-- 3. Create the unified log table
CREATE TABLE "tblWorkflowInstanceLogs" (
  "logID"          BIGSERIAL    NOT NULL,
  "instanceID"     UUID         NOT NULL,

  -- DB nodeID UUID (real runs) or frontend node UUID string (test runs).
  -- VARCHAR so it can hold both without a nullable FK constraint.
  -- NULL for INPUT_SET and SYSTEM_SET events.
  "nodeID"         VARCHAR,

  -- INPUT_SET | NODE_COMPLETED | NODE_FAILED | SYSTEM_SET
  "eventType"      VARCHAR      NOT NULL,

  -- 'success' | 'error' | NULL (null for INPUT_SET / SYSTEM_SET)
  "nodeStatus"     VARCHAR,

  -- Primary output key label — stored for queryability.
  -- Full data is always in payload.
  "outputVariable" VARCHAR,

  -- Context contribution folded by assembleContext.
  -- Empty {} for NODE_FAILED rows (failed nodes produce no output).
  "payload"        JSONB        NOT NULL DEFAULT '{}',

  -- Non-null only for NODE_FAILED rows.
  "errorMessage"   VARCHAR,

  "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT "tblWorkflowInstanceLogs_pkey"
    PRIMARY KEY ("logID"),

  CONSTRAINT "fk_tblWorkflowInstanceLogs_instanceID"
    FOREIGN KEY ("instanceID")
    REFERENCES "tblWorkflowInstances" ("instanceID")
    ON DELETE CASCADE
    ON UPDATE NO ACTION
);

-- Primary read pattern: all logs for one instance in order
CREATE INDEX "idx_tblWorkflowInstanceLogs_instance_seq"
  ON "tblWorkflowInstanceLogs" ("instanceID", "logID");

-- Barrier check: completed nodes for an instance
CREATE INDEX "idx_tblWorkflowInstanceLogs_barrier"
  ON "tblWorkflowInstanceLogs" ("instanceID", "eventType", "nodeID");

COMMIT;