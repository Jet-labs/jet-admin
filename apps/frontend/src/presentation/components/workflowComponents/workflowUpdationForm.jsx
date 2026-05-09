import React from "react";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import { WorkflowEditor } from "./workflowEditor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkflowByIDAPI, updateWorkflowAPI } from "../../../data/apis/workflow";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

import { Button, Spinner } from "@jet-admin/ui";

export const WorkflowUpdationForm = ({ tenantID, workflowID }) => {
  WorkflowUpdationForm.propTypes = {
    tenantID: PropTypes.string.isRequired,
    workflowID: PropTypes.string.isRequired,
  };
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingWorkflow,
    data: workflow,
    error: loadWorkflowError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID), workflowID],
    queryFn: () => getWorkflowByIDAPI({ tenantID, workflowID }),
    refetchOnWindowFocus: false,
  });

  const {
    isPending: isUpdatingWorkflow,
    mutate: updateWorkflow,
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
      workflowOptions: workflow?.workflowOptions || { args: [] },
    },
    validationSchema: formValidations.workflowUpdationFormValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      updateWorkflow(values);
    },
  });

  return (
    <div className="flex h-full w-full flex-col items-center bg-brand-dark">
      <div className="flex w-full flex-row items-start justify-between border-b border-border bg-brand-dark px-4 py-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-start">
            {CONSTANTS.STRINGS.UPDATE_WORKFLOW_FORM_TITLE}
          </h1>
          {workflow && (
            <span className="mt-1 text-xs text-muted-foreground">
              {`Workflow ID: ${workflow.workflowID}`}
            </span>
          )}
        </div>
        <Button
          type="button"
          onClick={workflowUpdationForm.handleSubmit}
          disabled={isUpdatingWorkflow}
        >
          {isUpdatingWorkflow && (
            <Spinner className="mr-2" size={16} />
          )}
          {CONSTANTS.STRINGS.UPDATE_WORKFLOW_BUTTON_TEXT}
        </Button>
      </div>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWorkflow}
        error={loadWorkflowError}
      >
        <form
          className="w-full flex-1 overflow-hidden"
          onSubmit={workflowUpdationForm.handleSubmit}
        >
          <WorkflowEditor workflowEditorForm={workflowUpdationForm} />
        </form>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
