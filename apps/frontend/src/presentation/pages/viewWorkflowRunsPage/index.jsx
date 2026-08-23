import React from "react";
import { useParams } from "react-router-dom";
import { WorkflowRunsHistoryGrid } from "../../components/workflowComponents/workflowRunsHistoryGrid";

const ViewWorkflowRunsPage = () => {
  const { tenantID, workflowID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <WorkflowRunsHistoryGrid tenantID={tenantID} workflowID={workflowID} />
    </div>
  );
};

export default ViewWorkflowRunsPage;
