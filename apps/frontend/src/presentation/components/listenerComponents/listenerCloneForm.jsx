import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from 'lucide-react';
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneListenerAPI } from "../../../data/apis/listener";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";

export const ListenerCloneForm = ({ tenantID, listenerID }) => {
  ListenerCloneForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    listenerID: PropTypes.string.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isCloningListener, mutate: cloneListener } = useMutation({
    mutationFn: () => {
      return cloneListenerAPI({
        tenantID,
        listenerID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.CLONE_LISTENER_CLONING_SUCCESS);
      queryClient.invalidateQueries({
        queryKey:
        CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID),
      });
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleCloneListener = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_LISTENER_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_LISTENER_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    if (!confirmed) return;
    cloneListener();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        square
        className="shrink-0"
        aria-label="Clone listener"
        onClick={_handleCloneListener}
        disabled={isCloningListener}
      >
        {isCloningListener ? (
          <Spinner size={14} />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </>
  );
};
