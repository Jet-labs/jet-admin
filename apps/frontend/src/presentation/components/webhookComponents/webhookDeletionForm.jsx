import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteWebhookByIDAPI } from "../../../data/apis/webhook";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";
import { Button, Spinner } from "@jet-admin/ui";

export const WebhookDeletionForm = ({ tenantID, webhookID }) => {
  WebhookDeletionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    webhookID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();

  const { isPending: isDeletingWebhook, mutate: deleteWebhook } = useMutation({
    mutationFn: () =>
      deleteWebhookByIDAPI({
        tenantID,
        webhookID,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.WEBHOOK_DELETED_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.WEBHOOKS(tenantID),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteClick = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_WEBHOOK_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_WEBHOOK_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;
    deleteWebhook();
  };

  return (
    <Button
      variant="destructive-ghost"
      size="sm"
      square
      onClick={_handleDeleteClick}
      disabled={isDeletingWebhook}
      type="button"
      className="shrink-0"
      aria-label="Delete webhook"
    >
      {isDeletingWebhook ? (
        <Spinner size={14} />
      ) : (
        <MdDeleteOutline className="h-4 w-4" />
      )}
    </Button>
  );
};
