import React from "react";
import { useParams } from "react-router-dom";
import { WorkflowAdditionForm } from "../../components/workflowComponents/workflowAdditionForm";

const AddWorkflowPage = () => {
  const { tenantID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
      <WorkflowAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddWorkflowPage;
