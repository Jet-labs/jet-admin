import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteListenerAPI } from "../../../data/apis/listener";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner } from "@jet-admin/ui";

export const ListenerDeletionForm = ({ tenantID, listenerID }) => {
  ListenerDeletionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    listenerID: PropTypes.string.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingListener, mutate: deleteListener } =
    useMutation({
      mutationFn: () => {
        return deleteListenerAPI({
          tenantID,
          listenerID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.LISTENER_DELETED_SUCCESS);
        queryClient.invalidateQueries({
          queryKey:
          [CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID)],
        });
        navigate(CONSTANTS.ROUTES.VIEW_LISTENERS.path(tenantID));
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleDeleteListener = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_LISTENER_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_LISTENER_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteListener();
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        square
        className="shrink-0"
        aria-label="Delete listener"
        onClick={_handleDeleteListener}
        disabled={isDeletingListener}
      >
        {isDeletingListener ? (
          <Spinner size={14} />
        ) : (
            <Trash2 className="h-3 w-3" />
        )}
      </Button>
    </>
  );
};
