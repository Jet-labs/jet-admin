import { useParams } from 'react-router-dom';
import { WorkflowUpdationForm } from '../../components/workflowComponents/workflowUpdationForm';

const UpdateWorkflowPage = () => {
  const { tenantID, workflowID } = useParams();

  return (
    <WorkflowUpdationForm tenantID={tenantID} workflowID={workflowID} />
  );
};

export default UpdateWorkflowPage;
