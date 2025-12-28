import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { WorkflowUpdationForm } from '../../components/workflowComponents/workflowUpdationForm';
import { getWorkflowByIDAPI } from '../../../data/apis/workflow';
import { CONSTANTS } from '../../../constants';
import { CircularProgress } from '@mui/material';

const UpdateWorkflowPage = () => {
  const { tenantID, workflowID } = useParams();

  const {
    isLoading: isLoadingWorkflow,
    data: workflow,
    error: loadWorkflowError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID), workflowID],
    queryFn: () => getWorkflowByIDAPI({ tenantID, workflowID }),
    refetchOnWindowFocus: false,
  });

  if (isLoadingWorkflow) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (loadWorkflowError) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <p className="text-red-500">Error loading workflow: {loadWorkflowError.message}</p>
      </div>
    );
  }

  return (
    <WorkflowUpdationForm tenantID={tenantID} workflow={workflow} />
  );
};

export default UpdateWorkflowPage;
