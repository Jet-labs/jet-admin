import { useFormik } from "formik";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import { WorkflowEditor } from "./workflowEditor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkflowAPI } from "../../../data/apis/workflow";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CircularProgress } from "@mui/material";

export const WorkflowUpdationForm = ({ tenantID, workflow }) => {
  WorkflowUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    workflow: PropTypes.object.isRequired,
  };
  const queryClient = useQueryClient();

  const {
    isPending: isUpdatingWorkflow,
    mutate: updateWorkflow,
    error: updateWorkflowError,
  } = useMutation(
    {
      mutationFn: (data) => {
        return updateWorkflowAPI({
          tenantID,
          workflowID: workflow.workflowID,
          workflowData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.UPDATE_WORKFLOW_FORM_WORKFLOW_UPDATION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    }
  );


  const workflowUpdationForm = useFormik({
    initialValues: {
      tenantID,
      title: workflow?.title || "",
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      workflowConfig: workflow?.workflowConfig || {},
    },
    validationSchema: formValidations.workflowUpdationFormValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      updateWorkflow(values);
      console.log(values);
    },
  });

  return <div className="w-full flex flex-col justify-start items-center h-full">
    <div className="w-full p-3 border-b border-slate-200 flex flex-row justify-between items-center">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start">
        {CONSTANTS.STRINGS.UPDATE_WORKFLOW_FORM_TITLE}
      </h1>
      <button
        type="button"
        onClick={workflowUpdationForm.handleSubmit}
        disabled={isUpdatingWorkflow}
        className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50  outline-none focus:outline-none"
      >
        {isUpdatingWorkflow && (
          <CircularProgress className="!mr-3" size={16} color="white" />
        )}
        {CONSTANTS.STRINGS.UPDATE_WORKFLOW_BUTTON_TEXT}
      </button>
    </div>

    <form
      className="w-full h-full "
      onSubmit={workflowUpdationForm.handleSubmit}
    >
      <WorkflowEditor workflowEditorForm={workflowUpdationForm} />
    </form>
  </div>
}
