import React from "react";
import { useParams } from "react-router-dom";
import { WorkflowUpdationForm } from "../../components/workflowComponents/workflowUpdationForm";

const UpdateWorkflowPage = () => {
  const { tenantID, workflowID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <WorkflowUpdationForm tenantID={tenantID} workflowID={workflowID} />
    </div>
  );
};

export default UpdateWorkflowPage;
