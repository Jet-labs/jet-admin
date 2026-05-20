import React from "react";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { formValidations } from "../../../utils/formValidation";
import { WorkflowEditor } from "./workflowEditor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkflowByIDAPI, updateWorkflowAPI, deleteWorkflowAPI } from "../../../data/apis/workflow";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { useGlobalUI } from "../../../logic/stores/useUIStore";

import { PageHeader } from "@jet-admin/ui";
import { WorkflowCloneForm } from "./workflowCloneForm";
import { WorkflowDeletionForm } from "./workflowDeletionForm";

export const WorkflowUpdationForm = ({ tenantID, workflowID }) => {
  WorkflowUpdationForm.propTypes = {
    tenantID: PropTypes.string.isRequired,
    workflowID: PropTypes.string.isRequired,
  };
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();

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
    <div className="flex h-full w-full flex-col items-center bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.UPDATE_WORKFLOW_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_WORKFLOWS_TITLE}
        id={workflowID}
        onSave={workflowUpdationForm.handleSubmit}
        isSaving={isUpdatingWorkflow}
      >
        <WorkflowDeletionForm tenantID={tenantID} workflowID={workflowID} />
        <WorkflowCloneForm tenantID={tenantID} workflowID={workflowID} />
      </PageHeader>
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
