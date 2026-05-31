import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from 'lucide-react';
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneWidgetByIDAPI } from "../../../data/apis/widget";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";
export const WidgetCloneForm = ({ tenantID, widgetID }) => {
  WidgetCloneForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isCloningWidget, mutate: cloneWidget } = useMutation({
    mutationFn: () => {
      return cloneWidgetByIDAPI({
        tenantID,
        widgetID,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.CLONE_WIDGET_CLONING_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleCloneWidget = async () => {
    const confirmed = await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_WIDGET_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_WIDGET_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    if (!confirmed) return;
    cloneWidget();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        square
        onClick={_handleCloneWidget}
        disabled={isCloningWidget}
        aria-label="Widget clone"
      >
        {isCloningWidget ? (
          <Spinner size={16} />
        ) : (
            <Copy className="h-3 w-3" />
        )}
      </Button>
    </>
  );
};
