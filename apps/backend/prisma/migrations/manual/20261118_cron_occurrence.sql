-- Apply with the repository manual migration runner's transaction.
-- lastScheduledAt is the persisted occurrence ledger used to claim a tick
-- exactly once across replicas. nextRunAt is maintained from the schedule.
ALTER TABLE "tblCronJobs"
  ADD COLUMN IF NOT EXISTS "lastScheduledAt" TIMESTAMPTZ(6);
