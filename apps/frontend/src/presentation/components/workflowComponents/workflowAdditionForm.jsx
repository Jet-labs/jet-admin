import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import { WorkflowEditor } from "./workflowEditor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkflowAPI } from "../../../data/apis/workflow";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useUnsavedChangesGuard } from "../../../logic/hooks/useUnsavedChangesGuard";

import { PageHeader } from "@jet-admin/ui";

export const WorkflowAdditionForm = ({ tenantID }) => {
  WorkflowAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [createdWorkflowID, setCreatedWorkflowID] = useState(null);

  const {
    isPending: isAddingWorkflow,
    mutate: addWorkflow,
  } = useMutation(
    {
      mutationFn: (data) => {
        return createWorkflowAPI({
          tenantID,
          workflowData: data,
        });
      },
      retry: false,
      onSuccess: (workflow, submittedValues) => {
        // Leave the Create route after a successful save. The editor derives
        // test-run attribution from the saved workflow route, not its title.
        workflowAdditionForm.resetForm({ values: submittedValues });
        setCreatedWorkflowID(workflow.workflowID);
        displaySuccess(CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_WORKFLOW_ADDITION_SUCCESS);
        queryClient.invalidateQueries({
          queryKey:
          [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID)],
        });
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
      workflowOptions: {},
    },
    validationSchema: formValidations.workflowAdditionFormValidationSchema,
    onSubmit: (values) => {
      addWorkflow(values);
    },
  });

  useUnsavedChangesGuard({
    isDirty: workflowAdditionForm.dirty,
    title: CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_TITLE,
  });

  // Navigate after resetForm has rendered a clean guard, rather than asking
  // the user to discard the graph they just saved.
  useEffect(() => {
    if (createdWorkflowID) {
      navigate(CONSTANTS.ROUTES.UPDATE_WORKFLOW_BY_ID.path(tenantID, createdWorkflowID), { replace: true });
    }
  }, [createdWorkflowID, navigate, tenantID]);


  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_WORKFLOWS_TITLE}
        onSave={workflowAdditionForm.handleSubmit}
        isSaving={isAddingWorkflow}
        saveText="Save"
      />

      <form
        className="w-full flex-1 overflow-hidden"
        onSubmit={workflowAdditionForm.handleSubmit}
      >
        <WorkflowEditor workflowEditorForm={workflowAdditionForm} />
      </form>
    </div>
  );
};
