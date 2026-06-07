import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from 'lucide-react';
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteWorkflowAPI } from "../../../data/apis/workflow";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";

export const WorkflowDeletionForm = ({ tenantID, workflowID }) => {
  WorkflowDeletionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    workflowID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();

  const { isPending: isDeletingWorkflow, mutate: deleteWorkflow } = useMutation({
    mutationFn: () => deleteWorkflowAPI({ tenantID, workflowID }),
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.WORKFLOW_DELETED_SUCCESS);
      queryClient.invalidateQueries({
        queryKey:
        [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID)],
      });
      navigate(CONSTANTS.ROUTES.VIEW_WORKFLOWS.path(tenantID));
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteWorkflow = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_WORKFLOW_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_WORKFLOW_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteWorkflow();
  };

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      square
      onClick={_handleDeleteWorkflow}
      disabled={isDeletingWorkflow}
      className="shrink-0"
      aria-label="Delete workflow"
    >
      {isDeletingWorkflow ? (
        <Spinner size={14} />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
    </Button>
  );
};
