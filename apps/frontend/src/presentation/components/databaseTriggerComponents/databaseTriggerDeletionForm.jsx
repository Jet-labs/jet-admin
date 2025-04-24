import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { deleteDatabaseTriggerByNameAPI } from "../../../data/apis/databaseTrigger";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";

export const DatabaseTriggerDeletionForm = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTriggerName,
}) => {
  DatabaseTriggerDeletionForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    databaseTableName: PropTypes.string.isRequired,
    databaseTriggerName: PropTypes.string.isRequired,
  };
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();
  const {
    isPending: isDeletingDatabaseTrigger,
    mutate: deleteDatabaseTrigger,
  } = useMutation({
    mutationFn: () => {
      return deleteDatabaseTriggerByNameAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_TRIGGERS(
          tenantID,
          databaseSchemaName
        ),
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleDeleteDashboard = async () => {
    await showConfirmation({
      title: CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_DIALOG_TITLE,
      message: CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_DIALOG_MESSAGE,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    deleteDatabaseTrigger();
  };

  return (
    <>
      <button
        onClick={_handleDeleteDashboard}
        disabled={isDeletingDatabaseTrigger}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-red-50 ms-2 px-1 py-1 text-xs text-red-400 hover:bg-red-100 focus:ring-2 focus:ring-red-400 outline-none focus:outline-none hover:border-red-400"
      >
        {isDeletingDatabaseTrigger ? (
          <CircularProgress className="!text-xs" size={16} color="white" />
        ) : (
          <MdDeleteOutline className="text-xl text-red-400 hover:text-red-500" /> 
        )}
      </button>
    </>
  );
};
