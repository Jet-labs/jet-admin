import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDatabaseWidgetByIDAPI } from "../../../data/apis/databaseWidget";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import React from "react";

export const DatabaseWidgetDeletionForm = ({ tenantID, databaseWidgetID }) => {
  DatabaseWidgetDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseWidgetID: PropTypes.number.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const { isPending: isDeletingDatabaseWidget, mutate: deleteDatabaseWidget } =
    useMutation({
      mutationFn: () => {
        return deleteDatabaseWidgetByIDAPI({
          tenantID,
          databaseWidgetID,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.DELETE_WIDGET_DELETION_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATABASE_WIDGETS(tenantID),
        ]);
        navigate(-1);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleDeleteWidget = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.DELETE_WIDGET_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.DELETE_WIDGET_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteDatabaseWidget();
  };

  return (
    <>
      <button
        onClick={_handleDeleteWidget}
        disabled={isDeletingDatabaseWidget}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-red-50 ms-2 px-1 py-1 text-xs text-red-400 hover:bg-red-100 focus:ring-2 focus:ring-red-400 outline-none focus:outline-none hover:border-red-400"
      >
        {isDeletingDatabaseWidget ? (
          <CircularProgress size={16} color="white" />
        ) : (
          <MdDeleteOutline className="text-xl text-red-400 hover:text-red-500" />
        )}
      </button>
    </>
  );
};
