import React from "react";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import { WorkflowEditor } from "./workflowEditor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkflowAPI } from "../../../data/apis/workflow";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner, PageHeader } from "@jet-admin/ui";

export const WorkflowAdditionForm = ({ tenantID }) => {
  WorkflowAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();

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
      onSuccess: () => {
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
    },
    validationSchema: formValidations.workflowAdditionFormValidationSchema,
    onSubmit: (values) => {
      addWorkflow(values);
    },
  });


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