ALTER TABLE "tblCronJobs" DROP CONSTRAINT IF EXISTS "fkTblConJobsDataQueryID";
ALTER TABLE "tblCronJobs" ADD COLUMN "workflowID" UUID;
ALTER TABLE "tblCronJobs" ADD COLUMN "workflowConfig" JSONB;
ALTER TABLE "tblCronJobs" ADD CONSTRAINT "fkTblCronJobsWorkflowID" FOREIGN KEY ("workflowID") REFERENCES "tblWorkflows"("workflowID") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "tblCronJobs" DROP COLUMN IF EXISTS "dataQueryID";
ALTER TABLE "tblCronJobs" DROP COLUMN IF EXISTS "dataQueryArgValues";
