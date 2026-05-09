import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { FaRegClone } from "react-icons/fa6";
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
    await showConfirmation({
      title: CONSTANTS.STRINGS.CLONE_WIDGET_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.CLONE_WIDGET_DIALOG_MESSAGE,
      confirmText: "Clone",
      cancelText: "Cancel",
      confirmButtonClass: "!bg-primary",
    });
    cloneWidget();
  };

  return (
    <>
      <Button
        type="button"
        variant="primary-ghost"
        size="sm"
        square
        onClick={_handleCloneWidget}
        disabled={isCloningWidget}
      >
        {isCloningWidget ? (
          <Spinner size={16} />
        ) : (
            <FaRegClone className="size-4 text-primary" />
        )}
      </Button>
    </>
  );
};
