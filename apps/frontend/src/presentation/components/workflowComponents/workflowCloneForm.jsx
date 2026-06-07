import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from 'lucide-react';
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneWorkflowAPI } from "../../../data/apis/workflow";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";

export const WorkflowCloneForm = ({ tenantID, workflowID }) => {
  WorkflowCloneForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    workflowID: PropTypes.string.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isCloningWorkflow, mutate: cloneWorkflow } = useMutation({
    mutationFn: () => {
      return cloneWorkflowAPI({
        tenantID,
        workflowID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.CLONE_WORKFLOW_CLONING_SUCCESS);
      queryClient.invalidateQueries({
        queryKey:
        [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID)],
      });
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleCloneWorkflow = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_WORKFLOW_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_WORKFLOW_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    if (!confirmed) return;
    cloneWorkflow();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        square
        onClick={_handleCloneWorkflow}
        disabled={isCloningWorkflow}
        aria-label="Workflow clone"
      >
        {isCloningWorkflow ? (
          <Spinner size={14} />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </>
  );
};
