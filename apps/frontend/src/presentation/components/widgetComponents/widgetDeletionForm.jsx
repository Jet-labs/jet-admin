import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteWidgetByIDAPI } from "../../../data/apis/widget";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner } from "@jet-admin/ui";
export const WidgetDeletionForm = ({ tenantID, widgetID }) => {
  WidgetDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingWidget, mutate: deleteWidget } = useMutation({
    mutationFn: () => {
      return deleteWidgetByIDAPI({
        tenantID,
        widgetID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.DELETE_WIDGET_DELETION_SUCCESS);
      queryClient.invalidateQueries({
        queryKey:
        CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      });
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteWidget = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_WIDGET_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_WIDGET_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteWidget();
  };

  return (
    <>
      <Button type="button"
        variant="destructive"
        size="icon"
        square onClick={_handleDeleteWidget} disabled={isDeletingWidget} >
        {isDeletingWidget ? (
          <Spinner size={16} />
        ) : (
            <Trash2 className="h-3 w-3" />
        )}
      </Button>
    </>
  );
};
