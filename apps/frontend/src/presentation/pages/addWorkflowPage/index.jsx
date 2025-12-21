import React from 'react';
import { useParams } from 'react-router-dom';
import { WorkflowAdditionForm } from '../../components/workflowComponents/workflowAdditionForm';

const AddWorkflowPage = () => {
  const { workflowID } = useParams();
  const { tenantID } = useParams();
  console.log({ workflowID, tenantID });

  // We could also fetch/validate tenantID here if needed
  
  return (
    <WorkflowAdditionForm tenantID={tenantID} />
  );
};

export default AddWorkflowPage;
