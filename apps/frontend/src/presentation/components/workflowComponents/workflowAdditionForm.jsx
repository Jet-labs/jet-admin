import { useFormik } from "formik";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import { WorkflowEditor } from "./workflowEditor";
import { WorkflowNodesProvider } from "@jet-admin/workflow-nodes";
import { useWorkflowState } from "../../../logic/contexts/workflowContext";
import { useMutation } from "@tanstack/react-query";
import { createWorkflowAPI } from "../../../data/apis/workflow";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CircularProgress } from "@mui/material";

export const WorkflowAdditionForm = ({ tenantID }) => {
  WorkflowAdditionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
  };

  const {
    isPending: isAddingWorkflow,
    mutate: addWorkflow,
    error: addWorkflowError,
  } = useMutation(
    {
      mutationFn: (data) => {
        return createWorkflowAPI({
          tenantID,
          workflowData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_WORKFLOW_ADDITION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    }
  );


  const workflowAdditionForm = useFormik({
    initialValues: {
      tenantID,
      title: "",
      nodes: [],
      edges: [],
      workflowConfig: {},
    },
    validationSchema: formValidations.workflowAdditionFormValidationSchema,
    onSubmit: (values) => {
      //   addWorkflow(values);
      addWorkflow(values);
      console.log(values);
    },
  });


  return <div className="w-full flex flex-col justify-start items-center h-full">
    <div className="w-full p-3 border-b border-slate-200 flex flex-row justify-between items-center">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start">
        {CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_TITLE}
      </h1>
      <button
        type="button"
        onClick={workflowAdditionForm.handleSubmit}
        disabled={isAddingWorkflow}
        className="flex flex-row items-center justify-center rounded bg-[#646cff] px-3 py-1 text-sm text-white  focus:ring-2 focus:ring-[#646cff]/50  outline-none focus:outline-none"
      >
        {isAddingWorkflow && (
          <CircularProgress className="!mr-3" size={16} color="white" />
        )}
        {CONSTANTS.STRINGS.ADD_WORKFLOW_BUTTON_TEXT}
      </button>
    </div>

    <form
      className="w-full h-full "
      onSubmit={workflowAdditionForm.handleSubmit}
    >
      <WorkflowEditor workflowEditorForm={workflowAdditionForm} />
    </form>
  </div>
}