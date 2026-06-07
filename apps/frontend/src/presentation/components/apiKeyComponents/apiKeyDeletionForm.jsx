import React from "react";
import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteAPIKeyByIDAPI } from "../../../data/apis/apiKey";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import { Button, Spinner } from "@jet-admin/ui";
export const APIKeyDeletionForm = ({ tenantID, apiKeyID }) => {
  APIKeyDeletionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    apiKeyID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingAPIKey, mutate: deleteAPIKey } = useMutation({
    mutationFn: () => {
      return deleteAPIKeyByIDAPI({
        tenantID,
        apiKeyID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.DELETE_API_KEY_DELETION_SUCCESS);
      queryClient.invalidateQueries({
        queryKey:
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID),
      });
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteNotification = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_API_KEY_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_API_KEY_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteAPIKey();
  };

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      square
      className="shrink-0"
      aria-label="Delete API key"
      onClick={_handleDeleteNotification}
      disabled={isDeletingAPIKey}
    >
      {isDeletingAPIKey ? (
        <Spinner size={16} />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
    </Button>
  );
};
