import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
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
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_API_KEYS(tenantID),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteNotification = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_API_KEY_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_API_KEY_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteAPIKey();
  };

  return (
    <Button
      variant="destructive-ghost"
      size="sm"
      square
      onClick={_handleDeleteNotification}
      disabled={isDeletingAPIKey}
      type="button"
      className="shrink-0"
      aria-label="Delete API key"
    >
      {isDeletingAPIKey ? (
        <Spinner size={16} />
      ) : (
        <MdDeleteOutline className="h-4 w-4" />
      )}
    </Button>
  );
};
