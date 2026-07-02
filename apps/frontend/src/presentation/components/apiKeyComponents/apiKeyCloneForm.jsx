import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from 'lucide-react';
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneAPIKeyAPI } from "../../../data/apis/apiKey";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";
import { APIKeyDisplayDialog } from "./apiKeyDisplayDialog";

import { Button, Spinner } from "@jet-admin/ui";

export const APIKeyCloneForm = ({ tenantID, apiKeyID }) => {
  APIKeyCloneForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    apiKeyID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();

  const [clonedKey, setClonedKey] = useState(null);
  const [isDisplayDialogOpen, setIsDisplayDialogOpen] = useState(false);

  const { isPending: isCloningAPIKey, mutate: cloneAPIKey } = useMutation({
    mutationFn: () => {
      return cloneAPIKeyAPI({
        tenantID,
        apiKeyID,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(CONSTANTS.STRINGS.CLONE_API_KEY_CLONING_SUCCESS);
      queryClient.invalidateQueries({
        queryKey:
        [CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID)],
      });
      setClonedKey(data);
      setIsDisplayDialogOpen(true);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleCloneAPIKey = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_API_KEY_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_API_KEY_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    if (!confirmed) return;
    cloneAPIKey();
  };

  const handleCloseDisplayDialog = () => {
    setIsDisplayDialogOpen(false);
    navigate(-1);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        square
        className="shrink-0"
        aria-label="Clone api key"
        onClick={_handleCloneAPIKey}
        disabled={isCloningAPIKey}
      >
        {isCloningAPIKey ? (
          <Spinner size={14} />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>

      <APIKeyDisplayDialog
        open={isDisplayDialogOpen}
        onClose={handleCloseDisplayDialog}
        apiKey={clonedKey}
      />
    </>
  );
};
