-- The manual migration runner supplies the transaction. Requests refer to an
-- execution snapshot, not to mutable/saved definition nodes (including tests).
ALTER TABLE "tblWorkflowDataCollectionRequests"
  DROP CONSTRAINT IF EXISTS "fk_tblWorkflowDataCollectionRequests_nodeID";
ALTER TABLE "tblWorkflowDataCollectionRequests"
  ALTER COLUMN "nodeID" TYPE VARCHAR USING "nodeID"::text,
  ADD COLUMN IF NOT EXISTS "waitID" VARCHAR,
  ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "deliveryToken" UUID,
  ADD COLUMN IF NOT EXISTS "deliveryLeaseUntil" TIMESTAMPTZ(6);
ALTER TABLE "tblWorkflowInstanceLogs" ALTER COLUMN "nodeID" TYPE VARCHAR USING "nodeID"::text;
CREATE UNIQUE INDEX IF NOT EXISTS "tblWorkflowDataCollectionRequests_instanceID_waitID_key"
  ON "tblWorkflowDataCollectionRequests" ("instanceID", "waitID");
