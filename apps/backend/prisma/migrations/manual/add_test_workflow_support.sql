-- Add isTest column to tblWorkflowInstances
ALTER TABLE "tblWorkflowInstances" 
ADD COLUMN IF NOT EXISTS "isTest" BOOLEAN NOT NULL DEFAULT false;

-- Make workflowID nullable in tblWorkflowInstances
ALTER TABLE "tblWorkflowInstances" 
ALTER COLUMN "workflowID" DROP NOT NULL;

-- Drop the existing foreign key constraint if it exists
ALTER TABLE "tblWorkflowInstances" 
DROP CONSTRAINT IF EXISTS "tblWorkflowInstances_workflowID_fkey";

-- Re-add the foreign key as optional
ALTER TABLE "tblWorkflowInstances"
ADD CONSTRAINT "tblWorkflowInstances_workflowID_fkey" 
FOREIGN KEY ("workflowID") REFERENCES "tblWorkflows"("workflowID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Add nodeUUID column to tblNodeExecutionLogs
ALTER TABLE "tblNodeExecutionLogs" 
ADD COLUMN IF NOT EXISTS "nodeUUID" VARCHAR;

-- Make nodeID nullable in tblNodeExecutionLogs
ALTER TABLE "tblNodeExecutionLogs" 
ALTER COLUMN "nodeID" DROP NOT NULL;

-- Drop the existing foreign key constraint if it exists
ALTER TABLE "tblNodeExecutionLogs" 
DROP CONSTRAINT IF EXISTS "tblNodeExecutionLogs_nodeID_fkey";

-- Re-add the foreign key as optional
ALTER TABLE "tblNodeExecutionLogs"
ADD CONSTRAINT "tblNodeExecutionLogs_nodeID_fkey" 
FOREIGN KEY ("nodeID") REFERENCES "tblWorkflowNodes"("nodeID") ON DELETE NO ACTION ON UPDATE NO ACTION;
