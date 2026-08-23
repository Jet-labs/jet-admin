import React from "react";
import { useParams } from "react-router-dom";
import { WorkflowRunDetails } from "../../components/workflowComponents/workflowRunDetails";

const ViewWorkflowRunDetailsPage = () => {
  const { tenantID, runID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <WorkflowRunDetails tenantID={tenantID} runID={runID} />
    </div>
  );
};

export default ViewWorkflowRunDetailsPage;
