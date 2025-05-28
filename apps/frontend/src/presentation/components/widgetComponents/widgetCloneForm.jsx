import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { FaRegClone } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { cloneWidgetByIDAPI } from "../../../data/apis/widget";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";

export const WidgetCloneForm = ({ tenantID, widgetID }) => {
  WidgetCloneForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
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
      confirmButtonClass: "!bg-[#646cff]",
    });
    cloneWidget();
  };

  return (
    <>
      <button
        onClick={_handleCloneWidget}
        disabled={isCloningWidget}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 ms-2 px-1 py-1 text-xs text-[#646cff]/50 hover:bg-[#646cff]/20 outline-none focus:outline-none hover:border-[#646cff]"
      >
        {isCloningWidget ? (
          <CircularProgress size={16} color="white" />
        ) : (
          <FaRegClone className="text-xl text-[#646cff] hover:text-[#646cff]" />
        )}
      </button>
    </>
  );
};
